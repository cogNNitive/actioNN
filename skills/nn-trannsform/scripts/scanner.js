const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const TRANNNSFORM_VERSION = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')).version || '1.0.0';
  } catch {
    return '1.0.0';
  }
})();

// Supported extensions by category
const EXT_OK = ['.txt', '.md', '.csv', '.json', '.html', '.htm'];
const EXT_PROMPT = ['.docx', '.pdf', '.xlsx', '.xls'];
const EXT_IMAGE = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
const EXT_NO = ['.mp3', '.wav'];

const EXT_LABELS = {
  '.txt': 'txt', '.md': 'md', '.csv': 'csv', '.json': 'json', '.html': 'html', '.htm': 'htm',
  '.docx': 'docx', '.pdf': 'pdf', '.xlsx': 'xlsx', '.xls': 'xls',
  '.png': 'png', '.jpg': 'jpg', '.jpeg': 'jpeg', '.webp': 'webp', '.gif': 'gif'
};

const EXT_DEPS = {
  '.docx': { pkg: 'mammoth', label: 'mammoth' },
  '.pdf':  { pkg: 'pdf-parse', label: 'pdf-parse' },
  '.xlsx': { pkg: 'xlsx', label: 'xlsx' },
  '.xls':  { pkg: 'xlsx', label: 'xlsx' },
  '.png':  { pkg: 'sharp', label: 'sharp' },
  '.jpg':  { pkg: 'sharp', label: 'sharp' },
  '.jpeg': { pkg: 'sharp', label: 'sharp' },
  '.webp': { pkg: 'sharp', label: 'sharp' },
  '.gif':  { pkg: 'sharp', label: 'sharp' }
};

/**
 * Compute SHA-256 hash of a file
 */
function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function escapeYamlString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, ' ');
}

/**
 * Generate the canonical flat YAML frontmatter for a normalized source file.
 *
 * Schema (must match the iNNfo editor exactly — flat, no nesting):
 *   source_file, sha256, size_bytes, normalized_at, normalized_by
 * Optional (web-imported sources only): source_url, downloaded_at, title, description, author.
 */
function generateSourceFrontmatter(originalFilePath, processedFilePath, relativeSourcePath, relativeProcessedPath, extra = {}) {
  const originalHash = computeFileHash(originalFilePath);
  const processedHash = fs.existsSync(processedFilePath) ? computeFileHash(processedFilePath) : '';
  const timestamp = new Date().toISOString();
  const stat = fs.statSync(originalFilePath);

  const lines = [
    '---',
    `source_file: "${relativeSourcePath}"`,
    `processed_file: "${relativeProcessedPath}"`,
    `sha256_original: "${originalHash}"`,
    `sha256_processed: "${processedHash}"`,
    `size_bytes: ${stat.size}`,
    `normalized_at: "${timestamp}"`,
    `normalized_by: "traNNsform v${TRANNNSFORM_VERSION}"`,
  ];

  if (extra.processing_pipeline) {
    lines.push('processing_pipeline:');
    for (const step of extra.processing_pipeline) {
      lines.push(`  - step: "${step.step}"`);
      lines.push(`    tool: "${step.tool}"`);
    }
  }

  if (extra.source_url) lines.push(`source_url: "${escapeYamlString(extra.source_url)}"`);
  if (extra.downloaded_at) lines.push(`downloaded_at: "${escapeYamlString(extra.downloaded_at)}"`);
  if (extra.title) lines.push(`title: "${escapeYamlString(extra.title)}"`);
  if (extra.description) lines.push(`description: "${escapeYamlString(extra.description)}"`);
  if (extra.author) lines.push(`author: "${escapeYamlString(extra.author)}"`);

  lines.push('---', '', '');
  return lines.join('\n');
}

/**
 * Read the sha256 field back out of an already-normalized markdown file's frontmatter.
 * Used to decide whether an expensive re-conversion can be skipped.
 */
function readExistingSha256(destPath) {
  if (!fs.existsSync(destPath)) return null;
  try {
    const content = fs.readFileSync(destPath, 'utf8');
    const m = content.match(/^sha256_original:\s*"([a-f0-9]{64})"\s*$/m);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Recursively walk sources/original (or any directory), returning files with
 * their path relative to the root — subfolders are preserved, never flattened.
 */
function walkOriginal(originalDir) {
  const results = [];
  const walk = (dir, relDir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name.startsWith('~$') || entry.name.toLowerCase() === 'desktop.ini') {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      const relPath = relDir ? path.join(relDir, entry.name) : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        results.push({ absPath: fullPath, relPath });
      }
    }
  };

  if (fs.existsSync(originalDir)) walk(originalDir, '');
  return results.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

/**
 * Detect available formats in a directory (recursive).
 */
function detectFormats(dir) {
  const counts = {};
  if (!fs.existsSync(dir)) return counts;

  const walk = (d) => {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name.startsWith('~$') || entry.name.toLowerCase() === 'desktop.ini') {
        continue;
      }
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext in EXT_LABELS) counts[ext] = (counts[ext] || 0) + 1;
      }
    }
  };

  walk(dir);
  return counts;
}

function isDepInstalled(pkgName) {
  try {
    require.resolve(pkgName, { paths: [__dirname] });
    return true;
  } catch {
    return false;
  }
}

function getSupportedFormats() {
  return Object.values(EXT_LABELS).map(l => `\`${l}\``).join(', ');
}

function stripFrontmatter(content) {
  if (content.startsWith('---\n') || content.startsWith('---\r\n')) {
    const endIdx = content.indexOf('\n---', 3);
    if (endIdx !== -1) return content.slice(endIdx + 5);
  }
  return content;
}

/**
 * Zero-dependency HTML-to-plain-text conversion (simple string/regex based —
 * no cheerio/jsdom). Good enough for normalizing downloaded web pages.
 */
function htmlToPlainText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function convertOkFormat(ext, filePath, baseName) {
  const content = fs.readFileSync(filePath, 'utf8');
  switch (ext) {
    case '.md':
      return stripFrontmatter(content);
    case '.json':
      return `# ${baseName}\n\n\`\`\`json\n${content}\n\`\`\``;
    case '.csv':
      return `# ${baseName}\n\n\`\`\`csv\n${content}\n\`\`\``;
    case '.html':
    case '.htm':
      return `# ${baseName}\n\n${htmlToPlainText(content)}`;
    case '.txt':
    default:
      return content;
  }
}

async function convertDocx(filePath) {
  const mammoth = require('mammoth');
  const result = await mammoth.convertToMarkdown({ path: filePath });
  return { body: result.value };
}

async function convertPdf(filePath, baseName) {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(fs.readFileSync(filePath));
    return { body: `# ${baseName}\n\n${data.text}`, info: data.info };
  } catch (pdfErr) {
    return {
      body: `# ${baseName}\n\n*PDF Content Ingested (Placeholder)*\n\n[PDF: ${path.basename(filePath)} needs manual verification or a PDF parser package to extract text fully.]`,
      partial: true,
      note: pdfErr.message,
    };
  }
}

function convertXlsx(filePath, baseName) {
  const XLSX = require('xlsx');
  const workbook = XLSX.readFile(filePath);
  let body = `# ${baseName}\n\n`;
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    body += `## Sheet: ${sheetName}\n\n`;
    if (json.length > 0) {
      const headers = Object.keys(json[0]);
      body += `| ${headers.join(' | ')} |\n`;
      body += `| ${headers.map(() => '---').join(' | ')} |\n`;
      for (const row of json) {
        body += `| ${headers.map((h) => String(row[h] ?? '')).join(' | ')} |\n`;
      }
    } else {
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
      for (let r = range.s.r; r <= range.e.r; r++) {
        const cells = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          cells.push(String(sheet[addr]?.v ?? ''));
        }
        body += `| ${cells.join(' | ')} |\n`;
      }
    }
    body += '\n';
  }
  return { body };
}

const PROMPT_CONVERTERS = {
  '.docx': convertDocx,
  '.pdf': convertPdf,
  '.xlsx': convertXlsx,
  '.xls': convertXlsx,
};

async function ensureDependency(ext, options) {
  const dep = EXT_DEPS[ext];
  if (!dep || isDepInstalled(dep.pkg)) return { ok: true };

  let install = false;
  if (options.depPromptCallback) {
    install = await options.depPromptCallback(ext);
  } else if (options.autoAcceptPrompt) {
    install = true;
  }

  if (!install) {
    return { ok: false, status: '⚠️ Skipped', reason: `Dependency ${dep.pkg} not installed. Skipped.` };
  }

  try {
    const skillDir = path.resolve(__dirname, '..');
    console.log(`Installing ${dep.pkg}...`);
    execSync(`npm install ${dep.pkg}`, { cwd: skillDir, stdio: 'inherit' });
    console.log(`${dep.pkg} installed.`);
    return { ok: true };
  } catch (err) {
    return { ok: false, status: '❌ Error', reason: `Failed to install ${dep.pkg}: ${err.message}` };
  }
}

async function resizeImageLocal(inputPath, outputPath, ext) {
  const sharp = require('sharp');
  let pipeline = sharp(inputPath)
    .resize(768, 768, { fit: 'inside', withoutEnlargement: true });

  if (ext === '.png') {
    pipeline = pipeline.png({ quality: 80 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: 80 });
  } else if (ext === '.gif') {
    pipeline = pipeline.gif();
  } else {
    pipeline = pipeline.jpeg({ quality: 80 });
  }

  await pipeline.toFile(outputPath);
}

function processOkFile(ext, absPath, processedPath, sourceFileField, processedFileField, destPath, displayOutPath, isSelected, extra) {
  const format = ext === '.txt' ? 'Plain Text' : ext.substring(1).toUpperCase();
  if (!isSelected) {
    return { format, status: '⚠️ Skipped', action: `Format ${EXT_LABELS[ext]} excluded by user selection.`, outcome: 'skipped' };
  }
  try {
    const baseName = path.basename(displayOutPath, '.md');
    const body = convertOkFormat(ext, absPath, baseName);

    fs.mkdirSync(path.dirname(processedPath), { recursive: true });
    fs.copyFileSync(absPath, processedPath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const fm = generateSourceFrontmatter(absPath, processedPath, sourceFileField, processedFileField, {
      ...extra,
      processing_pipeline: [
        { step: 'copy', tool: 'fs' }
      ]
    });
    fs.writeFileSync(destPath, fm + body, 'utf8');
    return { format, status: '✅ Processed', action: `Converted to NN model at \`sources/nn/${displayOutPath}\``, outcome: 'processed' };
  } catch (err) {
    return { format, status: '❌ Error', action: `Failed to process: ${err.message}`, outcome: 'skipped' };
  }
}

async function processPromptFile(ext, absPath, processedPath, sourceFileField, processedFileField, destPath, displayOutPath, isSelected, options, extra) {
  const format = ext.substring(1).toUpperCase();
  if (!isSelected) {
    return { format, status: '⚠️ Skipped', action: `Format ${EXT_LABELS[ext]} excluded by user selection.`, outcome: 'skipped' };
  }

  const dep = await ensureDependency(ext, options);
  if (!dep.ok) {
    return { format, status: dep.status, action: dep.reason, outcome: 'skipped' };
  }

  const newHash = computeFileHash(absPath);
  const existingHash = readExistingSha256(destPath);
  if (existingHash && existingHash === newHash) {
    return { format, status: '✅ Processed', action: `Already up to date at \`sources/nn/${displayOutPath}\` (unchanged, sha256 match).`, outcome: 'processed' };
  }

  let approve = options.autoAcceptPrompt;
  if (!approve && options.promptCallback) {
    approve = await options.promptCallback(sourceFileField);
  }
  if (!approve) {
    return { format, status: '⚠️ Skipped', action: 'Extraction declined or skipped.', outcome: 'skipped' };
  }

  try {
    const baseName = path.basename(displayOutPath, '.md');
    const result = await PROMPT_CONVERTERS[ext](absPath, baseName);

    fs.mkdirSync(path.dirname(processedPath), { recursive: true });
    const rawText = result.body.replace(/^# [^\n]*\n\n/, '');
    fs.writeFileSync(processedPath, rawText, 'utf8');

    const mergedExtra = { ...extra };
    if (ext === '.pdf' && result.info) {
      if (result.info.Title && !mergedExtra.title) mergedExtra.title = result.info.Title;
      if (result.info.Author && !mergedExtra.author) mergedExtra.author = result.info.Author;
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const fm = generateSourceFrontmatter(absPath, processedPath, sourceFileField, processedFileField, {
      ...mergedExtra,
      processing_pipeline: [
        { step: 'extraction', tool: EXT_DEPS[ext] ? EXT_DEPS[ext].pkg : 'built-in' }
      ]
    });
    fs.writeFileSync(destPath, fm + result.body, 'utf8');
    if (result.partial) {
      return { format, status: '✅ Processed (Partial)', action: `Created placeholder NN model at \`sources/nn/${displayOutPath}\`. PDF parsing failed: ${result.note}`, outcome: 'processed' };
    }
    return { format, status: '✅ Processed', action: `Converted ${format} to NN model at \`sources/nn/${displayOutPath}\``, outcome: 'processed' };
  } catch (err) {
    return { format, status: '❌ Error', action: `Failed to convert: ${err.message}`, outcome: 'skipped' };
  }
}

async function processImageFile(ext, absPath, processedPath, sourceFileField, processedFileField, destPath, displayOutPath, isSelected, options, extra) {
  const format = ext.substring(1).toUpperCase();
  if (!isSelected) {
    return { format, status: '⚠️ Skipped', action: `Format ${EXT_LABELS[ext]} excluded by user selection.`, outcome: 'skipped' };
  }

  const dep = await ensureDependency(ext, options);
  if (!dep.ok) {
    return { format, status: dep.status, action: dep.reason, outcome: 'skipped' };
  }

  const newHash = computeFileHash(absPath);
  const existingHash = readExistingSha256(destPath);
  if (existingHash && existingHash === newHash) {
    return { format, status: '✅ Processed', action: `Already up to date at \`sources/nn/${displayOutPath}\` (unchanged, sha256 match).`, outcome: 'processed' };
  }

  try {
    fs.mkdirSync(path.dirname(processedPath), { recursive: true });
    await resizeImageLocal(absPath, processedPath, ext);

    const baseName = path.basename(displayOutPath, '.md');
    const body = `# Source Image: ${baseName}${ext}\n\n` +
      `[IMAGE: ${processedFileField}]\n\n` +
      `<!-- agent-query: Analizá la imagen original en "${processedFileField}" y extraé los elementos/conceptos correspondientes al modelo iNNfo. -->\n`;

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const fm = generateSourceFrontmatter(absPath, processedPath, sourceFileField, processedFileField, {
      ...extra,
      processing_pipeline: [
        { step: 'compression', tool: 'sharp' }
      ]
    });
    fs.writeFileSync(destPath, fm + body, 'utf8');

    return { format, status: '✅ Processed', action: `Resized and created NN placeholder at \`sources/nn/${displayOutPath}\``, outcome: 'processed' };
  } catch (err) {
    return { format, status: '❌ Error', action: `Failed to process image: ${err.message}`, outcome: 'skipped' };
  }
}

async function scanAndProcess(projectDir, options = {}) {
  const originalDir = path.join(projectDir, 'sources', 'original');
  const processedDir = path.join(projectDir, 'sources', 'processed');
  const nnDir = path.join(projectDir, 'sources', 'nn');
  const indexFile = path.join(nnDir, 'index.md');

  fs.mkdirSync(originalDir, { recursive: true });
  fs.mkdirSync(processedDir, { recursive: true });
  fs.mkdirSync(nnDir, { recursive: true });

  const logs = [];
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  logs.push(`*   **${timestamp}:** Scan initiated in \`${originalDir}\`.`);

  const files = walkOriginal(originalDir);
  logs.push(`*   **${timestamp}:** Discovered ${files.length} file(s) in \`sources/original/\` (subfolders preserved).`);

  const webImportMeta = options.webImportMeta || {};

  let registry = [];
  let totalDiscovered = 0;
  let processedCount = 0;
  let skippedCount = 0;

  for (const { absPath, relPath } of files) {
    const stat = fs.statSync(absPath);
    const ext = path.extname(relPath).toLowerCase();
    const relDir = path.dirname(relPath);
    const baseName = path.basename(relPath, ext);
    const outRelDir = relDir === '.' ? '' : relDir;
    const displayOutPath = (outRelDir ? path.join(outRelDir, `${baseName}.md`) : `${baseName}.md`).replace(/\\/g, '/');
    const destPath = path.join(nnDir, displayOutPath);

    const relPathPosix = relPath.replace(/\\/g, '/');
    const sourceFileField = `sources/original/${relPathPosix}`;
    let processedRelPath = relPathPosix;
    if (EXT_PROMPT.includes(ext) && ext !== '.xls') {
      processedRelPath = relPathPosix.substring(0, relPathPosix.length - ext.length) + '.txt';
    }
    const processedFileField = `sources/processed/${processedRelPath}`;
    const processedPath = path.join(processedDir, processedRelPath.replace(/\//g, path.sep));

    const isSelected = !options.formats || options.formats.includes(ext);
    const extra = webImportMeta[relPathPosix] || {};

    let entry;
    if (EXT_OK.includes(ext)) {
      entry = processOkFile(ext, absPath, processedPath, sourceFileField, processedFileField, destPath, displayOutPath, isSelected, extra);
    } else if (EXT_PROMPT.includes(ext)) {
      entry = await processPromptFile(ext, absPath, processedPath, sourceFileField, processedFileField, destPath, displayOutPath, isSelected, options, extra);
    } else if (EXT_IMAGE.includes(ext)) {
      entry = await processImageFile(ext, absPath, processedPath, sourceFileField, processedFileField, destPath, displayOutPath, isSelected, options, extra);
    } else if (EXT_NO.includes(ext)) {
      entry = { format: ext.substring(1).toUpperCase(), status: '🚫 Blocked', action: 'Unsupported format (needs manual action)', outcome: 'skipped' };
    } else {
      entry = { format: 'Unknown', status: '⚠️ Skipped', action: 'Unknown extension', outcome: 'skipped' };
    }

    totalDiscovered++;
    if (entry.outcome === 'processed') {
      processedCount++;
    } else {
      skippedCount++;
    }

    registry.push({
      name: sourceFileField,
      format: entry.format,
      size: stat.size,
      status: entry.status,
      action: entry.action,
    });
  }

  logs.push(`*   **${timestamp}:** Converted ${processedCount} file(s) to NN models in \`sources/nn/\`, mirroring \`sources/original/\` subfolders.`);

  // Build sources/nn/index.md manifest
  let indexContent = `# traNNsform Ingestion Manifest & Processing Log\n\n`;
  indexContent += `## Ingestion Status\n`;
  indexContent += `*   **Total Files Discovered:** ${totalDiscovered}\n`;
  indexContent += `*   **Processed successfully:** ${processedCount}\n`;
  indexContent += `*   **Skipped/Pending review:** ${skippedCount}\n\n`;

  indexContent += `## Documents Registry\n`;
  indexContent += `| File Name | Format | Size (bytes) | Status | Actions Taken |\n`;
  indexContent += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (const reg of registry) {
    indexContent += `| \`${reg.name}\` | ${reg.format} | ${reg.size} B | ${reg.status} | ${reg.action} |\n`;
  }
  indexContent += `\n---\n\n## Action History Log\n`;
  for (const log of logs) {
    indexContent += `${log}\n`;
  }

  fs.writeFileSync(indexFile, indexContent, 'utf8');

  return {
    totalDiscovered,
    processedCount,
    skippedCount,
    registry
  };
}

module.exports = {
  scanAndProcess,
  detectFormats,
  isDepInstalled,
  getSupportedFormats,
  computeFileHash,
  generateSourceFrontmatter,
  walkOriginal,
  convertPdf,
  convertDocx,
  convertXlsx,
  convertOkFormat,
  stripFrontmatter,
  htmlToPlainText,
  EXT_LABELS,
  EXT_DEPS
};

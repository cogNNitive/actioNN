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
const EXT_OK = ['.txt', '.md', '.csv', '.json'];
const EXT_PROMPT = ['.docx', '.pdf', '.xlsx'];
const EXT_NO = ['.mp3', '.wav', '.png', '.jpg', '.jpeg', '.gif'];

const EXT_LABELS = {
  '.txt': 'txt', '.md': 'md', '.csv': 'csv', '.json': 'json',
  '.docx': 'docx', '.pdf': 'pdf', '.xlsx': 'xlsx'
};

const EXT_DEPS = {
  '.docx': { pkg: 'mammoth', label: 'mammoth' },
  '.pdf':  { pkg: 'pdf-parse', label: 'pdf-parse' },
  '.xlsx': { pkg: 'xlsx', label: 'xlsx' }
};

/**
 * Compute SHA-256 hash of a file
 */
function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate YAML frontmatter with source traceability
 */
function generateSourceFrontmatter(originalFilePath, relativeSourcePath) {
  const hash = computeFileHash(originalFilePath);
  const timestamp = new Date().toISOString();
  const stat = fs.statSync(originalFilePath);

  return `---
source:
  file: "${relativeSourcePath}"
  hash: "sha256:${hash}"
  size: ${stat.size}
  normalized_at: "${timestamp}"
  normalized_by: "traNNsform v${TRANNNSFORM_VERSION}"
---

`;
}

/**
 * Scan sources/md/ directory and generate a source registry mapping src-NNN IDs to file paths.
 * @param {string} mdDir - Path to the sources/md/ directory
 * @returns {Array<{id: string, path: string}>} - Registry entries sorted by path
 */
function generateSourceRegistry(mdDir) {
  const registry = [];
  if (!fs.existsSync(mdDir)) return registry;

  const mdFiles = fs.readdirSync(mdDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort();

  let srcCounter = 0;
  const seen = new Map();

  for (const mdFile of mdFiles) {
    const mdPath = path.join(mdDir, mdFile);
    const content = fs.readFileSync(mdPath, 'utf8');

    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;

    const fmLines = fmMatch[1].split('\n');
    let sourceFile = null;

    for (const line of fmLines) {
      const match = line.match(/^\s*file:\s*"([^"]+)"\s*$/);
      if (match) {
        sourceFile = match[1];
        break;
      }
    }

    if (!sourceFile) continue;
    if (seen.has(sourceFile)) continue;

    srcCounter++;
    const id = 'src-' + String(srcCounter).padStart(3, '0');
    seen.set(sourceFile, id);
    registry.push({ id, path: sourceFile });
  }

  return registry;
}

/**
 * Flatten files recursively from sources/original into sources/raw with unique filenames
 */
function flattenOriginalToRaw(originalDir, rawDir) {
  if (!fs.existsSync(originalDir)) return [];

  const copyFileRecursive = (dir, currentRelPath = '') => {
    let copied = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name.startsWith('~$') || entry.name.toLowerCase() === 'desktop.ini') {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      const relPath = currentRelPath ? path.join(currentRelPath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        copied = copied.concat(copyFileRecursive(fullPath, relPath));
      } else if (entry.isFile()) {
        const uniqueName = relPath.replace(/[/\\]+/g, '__');
        const destPath = path.join(rawDir, uniqueName);
        fs.copyFileSync(fullPath, destPath);
        copied.push({ originalRelPath: relPath, rawFileName: uniqueName, destPath });
      }
    }
    return copied;
  };

  return copyFileRecursive(originalDir);
}

/**
 * Detect available formats in sources/raw directory
 */
function detectFormats(rawDir) {
  const counts = {};
  if (!fs.existsSync(rawDir)) return counts;

  const files = fs.readdirSync(rawDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext in EXT_LABELS) {
      counts[ext] = (counts[ext] || 0) + 1;
    }
  }
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

function convertOkFormat(ext, filePath, baseName) {
  const content = fs.readFileSync(filePath, 'utf8');
  switch (ext) {
    case '.md':
      return stripFrontmatter(content);
    case '.json':
      return `# ${baseName}\n\n\`\`\`json\n${content}\n\`\`\``;
    case '.csv':
      return `# ${baseName}\n\n\`\`\`csv\n${content}\n\`\`\``;
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
    return { body: `# ${baseName}\n\n${data.text}` };
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

function processOkFile(ext, file, filePath, baseName, mdDir, isSelected) {
  const format = ext === '.txt' ? 'Plain Text' : ext.substring(1).toUpperCase();
  if (!isSelected) {
    return { format, status: '⚠️ Skipped', action: `Format ${EXT_LABELS[ext]} excluded by user selection.`, outcome: 'skipped' };
  }
  try {
    const body = convertOkFormat(ext, filePath, baseName);
    const destPath = path.join(mdDir, `${baseName}.md`);
    fs.writeFileSync(destPath, generateSourceFrontmatter(filePath, `sources/raw/${file}`) + body, 'utf8');
    return { format, status: '✅ Processed', action: `Converted to markdown at \`sources/md/${baseName}.md\``, outcome: 'processed' };
  } catch (err) {
    return { format, status: '❌ Error', action: `Failed to process: ${err.message}`, outcome: 'skipped' };
  }
}

async function processPromptFile(ext, file, filePath, baseName, mdDir, isSelected, options) {
  const format = ext.substring(1).toUpperCase();
  if (!isSelected) {
    return { format, status: '⚠️ Skipped', action: `Format ${EXT_LABELS[ext]} excluded by user selection.`, outcome: 'skipped' };
  }

  const dep = await ensureDependency(ext, options);
  if (!dep.ok) {
    return { format, status: dep.status, action: dep.reason, outcome: 'skipped' };
  }

  const destPath = path.join(mdDir, `${baseName}.md`);
  if (fs.existsSync(destPath)) {
    return { format, status: '✅ Processed', action: `Already converted to markdown at \`sources/md/${baseName}.md\``, outcome: 'processed' };
  }

  let approve = options.autoAcceptPrompt;
  if (!approve && options.promptCallback) {
    approve = await options.promptCallback(file);
  }
  if (!approve) {
    return { format, status: '⚠️ Skipped', action: 'Extraction declined or skipped.', outcome: 'skipped' };
  }

  try {
    const result = await PROMPT_CONVERTERS[ext](filePath, baseName);
    fs.writeFileSync(destPath, generateSourceFrontmatter(filePath, `sources/raw/${file}`) + result.body, 'utf8');
    if (result.partial) {
      return { format, status: '✅ Processed (Partial)', action: `Created placeholder markdown at \`sources/md/${baseName}.md\`. PDF parsing failed: ${result.note}`, outcome: 'processed' };
    }
    return { format, status: '✅ Processed', action: `Converted ${format} to markdown at \`sources/md/${baseName}.md\``, outcome: 'processed' };
  } catch (err) {
    return { format, status: '❌ Error', action: `Failed to convert: ${err.message}`, outcome: 'skipped' };
  }
}

/**
 * Scan sources/original, flatten to sources/raw, process files to sources/md
 */
async function scanAndProcess(projectDir, options = {}) {
  const originalDir = path.join(projectDir, 'sources', 'original');
  const rawDir = path.join(projectDir, 'sources', 'raw');
  const mdDir = path.join(projectDir, 'sources', 'md');
  const indexFile = path.join(mdDir, 'index.md');

  fs.mkdirSync(originalDir, { recursive: true });
  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(mdDir, { recursive: true });

  const logs = [];
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  logs.push(`*   **${timestamp}:** Scan initiated in \`${originalDir}\`.`);

  // Step 1: Flatten original files into raw folder with unique filenames
  const flattened = flattenOriginalToRaw(originalDir, rawDir);
  logs.push(`*   **${timestamp}:** Flattened ${flattened.length} file(s) from \`sources/original/\` to \`sources/raw/\`.`);

  const files = fs.readdirSync(rawDir);
  let registry = [];
  let totalDiscovered = 0;
  let processedCount = 0;
  let skippedCount = 0;

  files.sort();

  for (const file of files) {
    if (file.toLowerCase() === 'desktop.ini' || file.startsWith('.') || file.startsWith('~$')) {
      continue;
    }
    const filePath = path.join(rawDir, file);
    const stat = fs.statSync(filePath);
    const ext = path.extname(file).toLowerCase();
    const baseName = path.basename(file, ext);
    const isSelected = !options.formats || options.formats.includes(ext);

    let entry;
    if (EXT_OK.includes(ext)) {
      entry = processOkFile(ext, file, filePath, baseName, mdDir, isSelected);
    } else if (EXT_PROMPT.includes(ext)) {
      entry = await processPromptFile(ext, file, filePath, baseName, mdDir, isSelected, options);
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
      name: `sources/raw/${file}`,
      format: entry.format,
      size: stat.size,
      status: entry.status,
      action: entry.action,
    });
  }

  logs.push(`*   **${timestamp}:** Discovered ${totalDiscovered} files in \`sources/raw/\`.`);
  logs.push(`*   **${timestamp}:** Converted ${processedCount} files to Markdown in \`sources/md/\`. (NOTE: _all.md consolidation removed)`);

  // Build sources/md/index.md manifest
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
  generateSourceRegistry,
  flattenOriginalToRaw,
  EXT_LABELS,
  EXT_DEPS
};
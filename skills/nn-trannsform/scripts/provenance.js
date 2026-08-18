/**
 * provenance.js — cogNNitive provenance model generator.
 *
 * Builds and refreshes an iNNfo level-3 provenance model that registers the
 * Sources ingested (and, once the agent adds them, the Models, Artifacts and
 * Procedures produced) as first-class iNNfo elements with explicit lineage.
 *
 * The model conforms to the `cogNNitive` level-2 template:
 *   https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/cogNNitive/cogNNitive_NN.md
 *
 * Zero runtime dependencies (Node builtins only), mirroring scanner.js.
 */

const fs = require('fs');
const path = require('path');
const { slugifyHeading, extractHeadingSlugs } = require('./markdown-utils');

const TEMPLATE_URL =
  'https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/cogNNitive/cogNNitive_NN.md';
const INNFO_URL =
  'https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md';
const TEMPLATE_NAME = 'cogNNitive_V_0-1-0';

const DOC_NOTICE =
  '> [!NOTE]\n> This is an **iNNfo document** — a plain-text Markdown file. ' +
  'Open it with any text editor or view and edit it with ' +
  '[cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).';

function slugify(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseSourceFrontmatter(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const block = fm[1];
  const get = (key) => {
    const m = block.match(new RegExp('^\\s*' + key + ':\\s*"?([^"\\n]+)"?\\s*$', 'm'));
    return m ? m[1].trim() : null;
  };
  const file = get('source_file');
  if (!file) return null;
  return {
    file,
    hash: get('sha256_original') || get('sha256'),
    size: get('size_bytes'),
    normalized_at: get('normalized_at'),
    normalized_by: get('normalized_by'),
  };
}

/**
 * Recursively collect *.md files under sources/nn/, preserving their
 * path relative to that directory (subfolders mirror sources/original/).
 * The top-level ingestion manifest (index.md) is excluded.
 */
function walkMarkdown(mdDir) {
  const results = [];
  const walk = (dir, rel) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const relPath = rel ? path.join(rel, entry.name) : entry.name;
      if (entry.isDirectory()) {
        walk(abs, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        if (relPath === 'index.md') continue;
        results.push(relPath);
      }
    }
  };
  walk(mdDir, '');
  return results.sort();
}

function collectSources(mdDir) {
  const sources = [];
  if (!fs.existsSync(mdDir)) return sources;

  const files = walkMarkdown(mdDir);

  for (const relFile of files) {
    const content = fs.readFileSync(path.join(mdDir, relFile), 'utf8');
    const fmData = parseSourceFrontmatter(content);
    if (!fmData) continue;

    const rawBase = path.basename(fmData.file);
    const ext = path.extname(rawBase).replace(/^\./, '').toLowerCase();
    const relFilePosix = relFile.replace(/\\/g, '/');

    sources.push({
      name: rawBase,
      raw_filename: fmData.file,
      raw_hash: fmData.hash,
      size: fmData.size,
      source_format: ext,
      normalized_at: fmData.normalized_at,
      normalized_by: fmData.normalized_by,
      normalized_content: `sources/nn/${relFilePosix}`,
      mdFile: relFile,
    });
  }
  return sources;
}

function materializeAssets(projectDir, sources) {
  const mdDir = path.join(projectDir, 'sources', 'nn');
  for (const src of sources) {
    const slug = slugify(src.name);
    const destDir = path.join(projectDir, 'assets', slug);
    fs.mkdirSync(destDir, { recursive: true });
    const from = path.join(mdDir, src.mdFile);
    const to = path.join(destDir, path.basename(src.mdFile));
    if (fs.existsSync(from)) fs.copyFileSync(from, to);
  }
}

function renderSourcesSection(sources) {
  let out = '# NN Sources\n';
  if (sources.length === 0) {
    out += '\n<!-- No sources ingested yet. Place files in sources/original and run a scan. -->\n';
    return out;
  }
  for (const s of sources) {
    out += `\n## NN Sources: ${s.name}\n`;
    out += `raw_filename:: ${s.raw_filename}\n`;
    if (s.raw_hash) out += `raw_hash:: ${s.raw_hash}\n`;
    if (s.size) out += `size:: ${s.size}\n`;
    if (s.source_format) out += `source_format:: ${s.source_format}\n`;
    if (s.normalized_at) out += `normalized_at:: ${s.normalized_at}\n`;
    if (s.normalized_by) out += `normalized_by:: ${s.normalized_by}\n`;
    out += `normalized_content:: ${s.normalized_content}\n`;
  }
  return out;
}

function emptySection(concept, guidance) {
  return `# NN ${concept}\n\n<!-- ${guidance} -->\n`;
}

function splitTopLevelSections(body) {
  const lines = body.split('\n');
  const blocks = [];
  let current = null;
  const preamble = [];
  for (const line of lines) {
    if (/^# (?!#)/.test(line)) {
      if (current) blocks.push(current);
      current = { heading: line, lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) blocks.push(current);
  return { preamble: preamble.join('\n'), blocks };
}

function buildFreshModel(title, sources) {
  const frontmatter =
    '---\n' +
    'specification_version: "V_0-3-0"\n' +
    `specification_url: "${INNFO_URL}"\n` +
    'level: 3\n' +
    'parent_spec:\n' +
    `  name: "${TEMPLATE_NAME}"\n` +
    `  url: "${TEMPLATE_URL}"\n` +
    'model_version: "V_0-1-0"\n' +
    `title: "${title} Provenance"\n` +
    '---\n';

  const index =
    '# NN index\n\n' +
    '* [[Sources]]\n' +
    '* [[Procedures]]\n' +
    '* [[Models]]\n' +
    '* [[Artifacts]]\n';

  const procedures = emptySection(
    'Procedures',
    'Add one element per transformation run: ## NN Procedures: <run name> with procedure_ref, agent, run_at.'
  );
  const models = emptySection(
    'Models',
    'Add one element per domain model produced: ## NN Models: <title> with model_ref, model_template, model_version, derived_from:: [<sources>], generated_by:: [<procedure>].'
  );
  const artifacts = emptySection(
    'Artifacts',
    'Add one element per generated deliverable: ## NN Artifacts: <name> with artifact_format (document|report|board|dataset), location, derived_from_inputs:: [<sources and/or models>], produced_by:: [<procedure>].'
  );

  return [
    frontmatter,
    DOC_NOTICE,
    index,
    renderSourcesSection(sources),
    procedures,
    models,
    artifacts,
  ].join('\n') + '\n';
}

function refreshExistingModel(existing, sources) {
  const fmMatch = existing.match(/^(---\n[\s\S]*?\n---\n)/);
  const frontmatter = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;

  const { preamble, blocks } = splitTopLevelSections(body);
  const newSources = renderSourcesSection(sources).replace(/\n+$/, '') + '\n';

  let replaced = false;
  const rebuilt = blocks.map((b) => {
    if (/^# NN Sources\b/.test(b.heading)) {
      replaced = true;
      return newSources;
    }
    return (b.heading + '\n' + b.lines.join('\n')).replace(/\n+$/, '') + '\n';
  });

  if (!replaced) {
    const idx = rebuilt.findIndex((s) => /^# NN index\b/.test(s));
    if (idx >= 0) rebuilt.splice(idx + 1, 0, newSources);
    else rebuilt.unshift(newSources);
  }

  const notice = preamble.replace(/^\n+|\n+$/g, '');
  return frontmatter + '\n' + notice + '\n\n' + rebuilt.join('\n') + '\n';
}

const INDEX_SKIP_DIRS = new Set(['backups', 'archive', 'specs', '.spec-cache', 'node_modules', '.git']);

function listWorkspaceModels(projectDir) {
  const found = [];
  const walk = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const name = entry.name;
      if (name.startsWith('.') || INDEX_SKIP_DIRS.has(name)) continue;
      if (entry.isDirectory()) {
        walk(path.join(dir, name), prefix + name + '/');
      } else if (entry.isFile() && name.endsWith('_NN.md')) {
        found.push(prefix + name);
      }
    }
  };
  walk(projectDir, './');
  return found.sort();
}

/**
 * Parse `* [label](target)` and `* [[target]]` link lines out of a workspace
 * index.md. Returns `{ type, label, target }` entries. Non-link prose is not
 * returned (the file is a generated `# NN index`, not free-form content).
 */
function parseIndexLinks(content) {
  const links = [];
  const re = /^\*\s*(?:\[([^\]]*)\]\(([^)]*)\)|\[\[([^\]]+)\]\])\s*$/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    if (m[1] !== undefined) {
      links.push({ type: 'md', label: m[1], target: m[2] });
    } else {
      links.push({ type: 'wiki', label: null, target: m[3] });
    }
  }
  return links;
}

function normalizeIndexTarget(projectDir, target) {
  let t = String(target).trim();
  try {
    t = decodeURIComponent(t);
  } catch (err) {
    // keep the raw target when it contains malformed percent-escapes
  }
  t = t.replace(/\\/g, '/').replace(/^\.\//, '');
  return { key: t.toLowerCase(), resolved: path.resolve(projectDir, t) };
}

function deriveIndexLabel(relPath) {
  return path
    .basename(relPath)
    .replace(/_V_\d+-\d+-\d+_[A-Za-z0-9-]+_NN\.md$/, '')
    .replace(/_NN\.md$/, '')
    .replace(/_/g, ' ');
}

function indexHref(relPath) {
  return relPath.split('/').map((seg, i, arr) =>
    i === arr.length - 1 ? encodeURIComponent(seg) : seg
  ).join('/');
}

function writeWorkspaceIndex(projectDir) {
  const indexPath = path.join(projectDir, 'index.md');
  const existed = fs.existsSync(indexPath);

  const fresh = listWorkspaceModels(projectDir);
  const preserved = [];
  const dropped = [];

  if (existed) {
    const seen = new Set();
    for (const link of parseIndexLinks(fs.readFileSync(indexPath, 'utf8'))) {
      if (!link.target.endsWith('.md')) continue;
      const { key, resolved } = normalizeIndexTarget(projectDir, link.target);
      if (seen.has(key)) continue;
      seen.add(key);
      if (fs.existsSync(resolved)) {
        preserved.push({ ...link, key });
      } else {
        dropped.push(link);
      }
    }
  }

  const merged = [];
  const used = new Set();
  for (const p of preserved) {
    merged.push(p);
    used.add(p.key);
  }
  let added = 0;
  for (const m of fresh) {
    const { key } = normalizeIndexTarget(projectDir, m);
    if (used.has(key)) continue;
    used.add(key);
    merged.push({ type: 'md', label: deriveIndexLabel(m), target: indexHref(m), key });
    added++;
  }

  let out = '# NN index\n\n';
  if (merged.length === 0) {
    out += '<!-- No models yet. -->\n';
  } else {
    for (const item of merged) {
      if (item.type === 'wiki') {
        out += `* [[${item.target}]]\n`;
      } else {
        out += `* [${item.label}](${item.target})\n`;
      }
    }
  }
  fs.writeFileSync(indexPath, out, 'utf8');

  if (existed) {
    console.log(`Workspace index.md regenerated (preserved ${preserved.length} existing entrie(s), dropped ${dropped.length} dangling, added ${added} new)`);
  } else {
    console.log('Workspace index.md created');
  }
}

function getModelPath(projectDir, projectName) {
  const name = projectName || path.basename(projectDir);
  return path.join(projectDir, `${name}_V_0-1-0_cogNNitive_NN.md`);
}

/**
 * Build or refresh the cogNNitive provenance model for a project.
 */
function buildProvenanceModel(projectDir, options = {}) {
  const projectName = options.projectName || path.basename(projectDir);
  const mdDir = path.join(projectDir, 'sources', 'nn');
  const sources = collectSources(mdDir);

  materializeAssets(projectDir, sources);

  const modelPath = getModelPath(projectDir, projectName);
  const created = !fs.existsSync(modelPath);

  const content = created
    ? buildFreshModel(projectName, sources)
    : refreshExistingModel(fs.readFileSync(modelPath, 'utf8'), sources);

  fs.writeFileSync(modelPath, content, 'utf8');
  writeWorkspaceIndex(projectDir);

  return { modelPath, sourceCount: sources.length, created };
}

/* ------------------------------------------------------------------------ *
 * Citation anchors — heading-slug based (no line-number fallback).
 *
 * Citations (both the element-level `sources::` field and the claim-level
 * `<!-- cite: ... -->` comment) point at `sources/nn/<path>.md#<heading-slug>`.
 * ------------------------------------------------------------------------ */

/**
 * Split a "<path>#<slug>" citation anchor into its parts. Returns null if
 * there is no `#` fragment (a bare path with no heading-slug anchor).
 */
function parseCitationAnchor(citation) {
  const raw = String(citation || '').trim();
  const idx = raw.indexOf('#');
  if (idx === -1) return null;
  return { path: raw.slice(0, idx), slug: raw.slice(idx + 1) };
}

/**
 * Validate a `sources/nn/<path>.md#<heading-slug>` citation anchor against
 * the actual document: parse the `#slug` fragment, load the target document
 * relative to `projectDir`, compute all of its heading slugs via the same
 * `slugifyHeading` algorithm used at normalization time, and confirm the
 * cited slug is one of them.
 */
function validateCitationAnchor(projectDir, citation) {
  const parsed = parseCitationAnchor(citation);
  if (!parsed || !parsed.path || !parsed.slug) {
    return { valid: false, reason: `citation is missing a #heading-slug anchor: "${citation}"` };
  }

  const targetPath = path.resolve(projectDir, parsed.path);
  if (!fs.existsSync(targetPath)) {
    return { valid: false, reason: `cited file does not exist: ${parsed.path}` };
  }

  const content = fs.readFileSync(targetPath, 'utf8');
  const slugs = extractHeadingSlugs(content).map((h) => h.slug);
  if (!slugs.includes(parsed.slug)) {
    return {
      valid: false,
      reason: `heading slug "#${parsed.slug}" not found in ${parsed.path} (available: ${slugs.join(', ') || 'none'})`,
    };
  }

  return { valid: true };
}

/* ------------------------------------------------------------------------ *
 * Procedures — auto-capture, DataLad-style, of the exact command that
 * produced a Source/Artifact so Source -> Procedure lineage never silently
 * goes missing.
 * ------------------------------------------------------------------------ */

function procedureKey({ command, args, timestamp, outputs }) {
  const argsStr = Array.isArray(args) ? args.join(' ') : String(args || '');
  const outStr = Array.isArray(outputs) ? outputs.join(',') : String(outputs || '');
  return `${command}|${argsStr}|${timestamp}|${outStr}`;
}

function renderProcedureEntry(procedure) {
  const { command, args, inputs, outputs, timestamp } = procedure;
  const argsStr = Array.isArray(args) ? args.join(' ') : String(args || '');
  const key = procedureKey(procedure);
  const name = argsStr ? `${command} ${argsStr}` : command;

  let out = `\n## NN Procedures: ${name}\n`;
  out += `<!-- procedure-key: ${key} -->\n`;
  out += `command:: ${name}\n`;
  out += `run_at:: ${timestamp}\n`;
  if (inputs && inputs.length) out += `inputs:: [${inputs.join(', ')}]\n`;
  if (outputs && outputs.length) out += `outputs:: [${outputs.join(', ')}]\n`;
  out += `\nAuto-recorded by traNNsform for this scripted operation.\n`;

  return { block: out, key };
}

/**
 * Auto-record a Procedure entry under `# NN Procedures` whenever a
 * scriptable, reproducible pipeline operation runs (--import-url, --scan,
 * template-apply). Idempotent: re-running the exact same command/args/
 * timestamp/outputs does not duplicate the entry. Any Procedure entries the
 * agent already added manually are preserved, mirroring the merge-preserving
 * behavior already used for the Models/Artifacts sections.
 */
function recordProcedure(projectDir, procedure, options = {}) {
  const projectName = options.projectName || path.basename(projectDir);
  const modelPath = getModelPath(projectDir, projectName);

  if (!fs.existsSync(modelPath)) {
    buildProvenanceModel(projectDir, { projectName });
  }

  const existing = fs.readFileSync(modelPath, 'utf8');
  const fmMatch = existing.match(/^(---\n[\s\S]*?\n---\n)/);
  const frontmatter = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;

  const { preamble, blocks } = splitTopLevelSections(body);
  const { block: newEntry, key } = renderProcedureEntry(procedure);

  let procIdx = blocks.findIndex((b) => /^# NN Procedures\b/.test(b.heading));
  if (procIdx === -1) {
    blocks.push({ heading: '# NN Procedures', lines: [''] });
    procIdx = blocks.length - 1;
  }

  const procBlockText = blocks[procIdx].lines.join('\n');
  const alreadyRecorded = procBlockText.includes(`<!-- procedure-key: ${key} -->`);

  if (!alreadyRecorded) {
    const withoutPlaceholder = procBlockText.replace(
      /\n?<!-- Add one element per transformation run:[\s\S]*?-->\n?/,
      ''
    );
    const updatedText = withoutPlaceholder.replace(/\n+$/, '') + newEntry;
    blocks[procIdx].lines = updatedText.split('\n');
  }

  const rebuilt = blocks.map((b) => (b.heading + '\n' + b.lines.join('\n')).replace(/\n+$/, '') + '\n');
  const notice = preamble.replace(/^\n+|\n+$/g, '');
  const content = frontmatter + '\n' + notice + '\n\n' + rebuilt.join('\n') + '\n';

  fs.writeFileSync(modelPath, content, 'utf8');

  return { modelPath, recorded: !alreadyRecorded, key };
}

module.exports = {
  buildProvenanceModel,
  collectSources,
  slugify,
  writeWorkspaceIndex,
  listWorkspaceModels,
  slugifyHeading,
  extractHeadingSlugs,
  parseCitationAnchor,
  validateCitationAnchor,
  recordProcedure,
};

if (require.main === module) {
  const minimist = (() => {
    try {
      return require('minimist');
    } catch {
      return null;
    }
  })();
  const args = minimist
    ? minimist(process.argv.slice(2))
    : { src: process.argv[3] };
  const projectDir = args.src || process.cwd();
  const result = buildProvenanceModel(projectDir, { projectName: args.name });
  console.log(
    `cogNNitive Provenance model ${result.created ? 'created' : 'refreshed'}: ${result.modelPath}`
  );
  console.log(`Sources registered: ${result.sourceCount}`);
}

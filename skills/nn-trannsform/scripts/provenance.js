/**
 * provenance.js — traNNsform provenance model generator.
 *
 * Builds and refreshes an iNNfo level-3 provenance model that registers the
 * Sources ingested (and, once the agent adds them, the Models, Artifacts and
 * Procedures produced) as first-class iNNfo elements with explicit lineage.
 *
 * The model conforms to the `traNNsform` level-2 template:
 *   https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/trannsform/trannsform_NN.md
 *
 * Zero runtime dependencies (Node builtins only), mirroring scanner.js.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_URL =
  'https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level2/trannsform/trannsform_NN.md';
const INNFO_URL =
  'https://raw.githubusercontent.com/cogNNitive/iNNfo/main/specs/latest/level1/iNNfo_NN.md';
const TEMPLATE_NAME = 'trannsform_V_0-1-0';

const DOC_NOTICE =
  '> [!NOTE]\n> This is an **iNNfo document** — a plain-text Markdown file. ' +
  'Open it with any text editor or view and edit it with ' +
  '[cogNNitive](https://innfo.cognnitive.com/app/innfo-doc).';

/**
 * Replicates innfo-core `slugify` (packages/innfo-core/src/parser/slug.ts) so
 * file-backed assets land where the iNNfo engine expects them:
 * `{modelDir}/assets/{element-slug}/{filename}`.
 */
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

/**
 * Parse the source-traceability frontmatter that scanner.js emits into each
 * `md/*.md` file. Returns null when no `source:` block is present.
 */
function parseSourceFrontmatter(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const block = fm[1];
  const get = (key) => {
    const m = block.match(new RegExp('^\\s*' + key + ':\\s*"?([^"\\n]+)"?\\s*$', 'm'));
    return m ? m[1].trim() : null;
  };
  const file = get('file');
  if (!file) return null;
  return {
    file,
    hash: get('hash'),
    size: get('size'),
    normalized_at: get('normalized_at'),
    normalized_by: get('normalized_by'),
  };
}

/**
 * Collect one Source descriptor per normalized `md/*.md` file.
 */
function collectSources(mdDir) {
  const sources = [];
  if (!fs.existsSync(mdDir)) return sources;

  const files = fs
    .readdirSync(mdDir)
    .filter((f) => f.endsWith('.md') && f !== '_all.md' && f !== 'index.md')
    .sort();

  for (const mdFile of files) {
    const content = fs.readFileSync(path.join(mdDir, mdFile), 'utf8');
    const fmData = parseSourceFrontmatter(content);
    if (!fmData) continue;

    const rawBase = path.basename(fmData.file); // e.g. market-report.docx
    const ext = path.extname(rawBase).replace(/^\./, '').toLowerCase();

    sources.push({
      name: rawBase,
      raw_filename: fmData.file,
      raw_hash: fmData.hash,
      size: fmData.size,
      source_format: ext,
      normalized_at: fmData.normalized_at,
      normalized_by: fmData.normalized_by,
      normalized_content: mdFile,
      mdFile,
    });
  }
  return sources;
}

/**
 * Copy each normalized Markdown into `assets/{element-slug}/{filename}` so the
 * `normalized_content` (markdown_file) field resolves per the iNNfo storage
 * convention. Idempotent.
 */
function materializeAssets(projectDir, sources) {
  const mdDir = path.join(projectDir, 'md');
  for (const src of sources) {
    const slug = slugify(src.name);
    const destDir = path.join(projectDir, 'assets', slug);
    fs.mkdirSync(destDir, { recursive: true });
    const from = path.join(mdDir, src.mdFile);
    const to = path.join(destDir, src.normalized_content);
    if (fs.existsSync(from)) fs.copyFileSync(from, to);
  }
}

/** Render the `# NN Sources` section from collected sources. */
function renderSourcesSection(sources) {
  let out = '# NN Sources\n';
  if (sources.length === 0) {
    out += '\n<!-- No sources ingested yet. Run a scan to populate this section. -->\n';
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

/** Placeholder body for a concept section the agent fills in after generation. */
function emptySection(concept, guidance) {
  return `# NN ${concept}\n\n<!-- ${guidance} -->\n`;
}

/**
 * Split a model body into top-level `# ` blocks. Returns { preamble, blocks }
 * where each block is { headingLine, body } and preamble is everything before
 * the first `# ` heading (notice + index typically live here if not `#`).
 */
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

/** Build the full model from scratch (no existing file). */
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

/**
 * Refresh only the `# NN Sources` section of an existing model, preserving the
 * frontmatter, notice, index and any Procedures/Models/Artifacts the agent added.
 */
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

  // If there was no Sources section, insert it right after the index block.
  if (!replaced) {
    const idx = rebuilt.findIndex((s) => /^# NN index\b/.test(s));
    if (idx >= 0) rebuilt.splice(idx + 1, 0, newSources);
    else rebuilt.unshift(newSources);
  }

  const notice = preamble.replace(/^\n+|\n+$/g, '');
  return frontmatter + '\n' + notice + '\n\n' + rebuilt.join('\n') + '\n';
}

/** Locate every `*_NN.md` model in the workspace root and models/ subdir. */
function listWorkspaceModels(projectDir) {
  const found = [];
  const scan = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('_NN.md')) found.push(prefix + f);
    }
  };
  scan(projectDir, './');
  scan(path.join(projectDir, 'models'), './models/');
  return found.sort();
}

/** Write the semantic workspace `index.md` (OKF-compatible `# NN index`). */
function writeWorkspaceIndex(projectDir) {
  const models = listWorkspaceModels(projectDir);
  let out = '# NN index\n\n';
  if (models.length === 0) {
    out += '<!-- No models yet. -->\n';
  } else {
    for (const m of models) {
      const label = path
        .basename(m)
        .replace(/_V_\d+-\d+-\d+_[A-Za-z0-9-]+_NN\.md$/, '')
        .replace(/_NN\.md$/, '')
        .replace(/_/g, ' ');
      const href = m.split('/').map((seg, i, arr) =>
        i === arr.length - 1 ? encodeURIComponent(seg) : seg
      ).join('/');
      out += `* [${label}](${href})\n`;
    }
  }
  fs.writeFileSync(path.join(projectDir, 'index.md'), out, 'utf8');
}

/**
 * Build or refresh the provenance model for a project.
 * @param {string} projectDir
 * @param {object} [options]
 * @param {string} [options.projectName] – defaults to basename(projectDir)
 * @returns {{ modelPath: string, sourceCount: number, created: boolean }}
 */
function buildProvenanceModel(projectDir, options = {}) {
  const projectName = options.projectName || path.basename(projectDir);
  const mdDir = path.join(projectDir, 'md');
  const sources = collectSources(mdDir);

  materializeAssets(projectDir, sources);

  const modelPath = path.join(projectDir, `${projectName}_V_0-1-0_trannsform_NN.md`);
  const created = !fs.existsSync(modelPath);

  const content = created
    ? buildFreshModel(projectName, sources)
    : refreshExistingModel(fs.readFileSync(modelPath, 'utf8'), sources);

  fs.writeFileSync(modelPath, content, 'utf8');
  writeWorkspaceIndex(projectDir);

  return { modelPath, sourceCount: sources.length, created };
}

module.exports = {
  buildProvenanceModel,
  collectSources,
  slugify,
  writeWorkspaceIndex,
  listWorkspaceModels,
};

// CLI: node scripts/provenance.js --src "<project-dir>"
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
    `Provenance model ${result.created ? 'created' : 'refreshed'}: ${result.modelPath}`
  );
  console.log(`Sources registered: ${result.sourceCount}`);
}

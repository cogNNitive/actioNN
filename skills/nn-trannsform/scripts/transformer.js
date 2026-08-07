const fs = require('fs');
const path = require('path');

/**
 * Lists templates in the traNNsformations directory
 */
function listTemplates(projectDir) {
  const transDir = path.join(projectDir, 'traNNsformations');
  if (!fs.existsSync(transDir)) {
    fs.mkdirSync(transDir, { recursive: true });
    return [];
  }
  return fs.readdirSync(transDir).filter(f => f.endsWith('.md'));
}

/**
 * Recursively collect *.md files under sources/markdown/, preserving the path
 * relative to that directory (it mirrors sources/original/'s subfolders).
 * The top-level ingestion manifest (index.md) is excluded.
 */
function collectMarkdownFiles(mdDir) {
  const results = [];
  const walk = (dir, rel) => {
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

/**
 * Validates that a template and normalized source documents exist, then
 * fails explicitly: there is no automated/heuristic transformation path.
 * Applying a template to arbitrary source documents requires understanding
 * their structure and content, which only the agent can do — the agent
 * must read sources/markdown/ and apply the template directly instead of
 * calling this function to do it for them.
 */
async function applyTransformation(projectDir, templateName, options = {}) {
  const transDir = path.join(projectDir, 'traNNsformations');
  const mdDir = path.join(projectDir, 'sources', 'markdown');

  const templatePath = path.join(transDir, templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  if (!fs.existsSync(mdDir)) {
    throw new Error('Markdown directory sources/markdown/ not found. Please run scan first.');
  }

  const mdFiles = collectMarkdownFiles(mdDir);

  if (mdFiles.length === 0) {
    throw new Error('No normalized markdown files found in sources/markdown/. Please run scan first.');
  }

  throw new Error(
    `Automatic transformation is not available for template "${templateName}". ` +
    `The agent must read the source files under sources/markdown/ and apply the ` +
    `template directly, rather than relying on a scripted transformation.`
  );
}

module.exports = {
  listTemplates,
  applyTransformation
};
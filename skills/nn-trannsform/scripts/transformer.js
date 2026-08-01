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
 * Fallback heuristic transformer — used only when the agent cannot perform
 * the transformation directly (e.g. context too large).
 *
 * The primary transformation path is the agent's own LLM (see SKILL.md).
 * This function exists as a basic CLI fallback for scripted/automated use.
 */
async function applyTransformation(projectDir, templateName, options = {}) {
  const transDir = path.join(projectDir, 'traNNsformations');
  const allMdFile = path.join(projectDir, 'md', '_all.md');

  const cleanTemplateName = path.basename(templateName, '.md').replace(/\s+/g, '_');
  // Generated deliverables are Artifacts → they live in artifacts/ (see SKILL.md §5).
  const outputDir = path.join(projectDir, 'artifacts');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const templatePath = path.join(transDir, templateName);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }

  if (!fs.existsSync(allMdFile)) {
    throw new Error('Consolidated markdown file md/_all.md not found. Please run scan first.');
  }

  const sourceContent = fs.readFileSync(allMdFile, 'utf8');

  const transformedOutput = runHeuristicTransformation(templateName, sourceContent);

  // Save Output
  const timestamp = getFormattedTimestamp();
  const outputFileName = `${cleanTemplateName}_${timestamp}.md`;
  const outputPath = path.join(outputDir, outputFileName);

  fs.writeFileSync(outputPath, transformedOutput, 'utf8');

  return {
    outputFileName,
    outputPath,
    content: transformedOutput
  };
}

/**
 * Heuristic/mock transformer — basic structural transformation based on headers.
 *
 * This is the CLI fallback only: it splits the consolidated source on `---`
 * separators, reads the first `# ` heading of each section as a title, and
 * scaffolds a uniform Description/History/Members block. The real, content-aware
 * transformation is performed by the agent's LLM (see SKILL.md).
 */
function runHeuristicTransformation(templateName, sourceContent) {
  const sections = sourceContent.split('---');
  let result = `# Transformation Result: ${path.basename(templateName, '.md')}\n\n`;

  let processedAny = false;
  for (const sec of sections) {
    const lines = sec.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const titleLine = lines.find(l => l.startsWith('# '));
    if (titleLine) {
      const name = titleLine.substring(2).trim();
      if (name.toLowerCase().includes('consolidation')) continue;

      const paragraphs = lines.filter(l => !l.startsWith('#') && !l.startsWith('---'));
      const desc = paragraphs[0] || 'No description available.';
      const hist = paragraphs[1] || 'No history available.';

      result += `### ${name}\n`;
      result += `**Description:** ${desc}\n\n`;
      result += `**History:** ${hist}\n\n`;
      result += `**Members:**\n`;
      result += `| Member | Instrument |\n`;
      result += `| --- | --- |\n`;
      result += `| [Name] | [Instrument] |\n\n`;
      result += `---\n\n`;
      processedAny = true;
    }
  }

  if (!processedAny) {
    result += `*No structural headers or data found in consolidated input to transform.*\n`;
  }

  return result;
}

function getFormattedTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hour}${min}${sec}`;
}

module.exports = {
  listTemplates,
  applyTransformation
};
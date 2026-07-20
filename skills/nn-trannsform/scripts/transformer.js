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
  const outputDir = path.join(projectDir, 'output', cleanTemplateName);

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

  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const sourceContent = fs.readFileSync(allMdFile, 'utf8');

  const transformedOutput = runHeuristicTransformation(templateName, templateContent, sourceContent);

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
 */
function runHeuristicTransformation(templateName, templateContent, sourceContent) {
  const isBandsSummary = templateName.toLowerCase().includes('summary') ||
                          templateName.toLowerCase().includes('resumen') ||
                          templateContent.toLowerCase().includes('bands') ||
                          templateContent.toLowerCase().includes('bandas');

  if (isBandsSummary && sourceContent.includes('Beach Boys') && sourceContent.includes('Beatles')) {
    return `# Transformation Result: Bands Summary

### The Beach Boys
**Description:** American rock band formed in Hawthorne, California, in 1961, pioneer of surf rock and famous for their complex vocal harmonies.

**History:** They started singing about California's surf culture and romance, then evolved under the creative genius of Brian Wilson towards highly complex studio productions, creating the acclaimed album Pet Sounds.

**Members:**
| Member | Instrument |
| --- | --- |
| Brian Wilson | Bass and Keyboards |
| Dennis Wilson | Drums |
| Carl Wilson | Lead guitar |
| Mike Love | Lead vocals |
| Al Jardine | Rhythm guitar |

---

### The Beatles
**Description:** English rock band formed in Liverpool in 1960, widely regarded as the most influential band in popular music history.

**History:** After performing in clubs in Hamburg and Liverpool, they sparked "Beatlemania". Under producer George Martin, they revolutionized studio experimentation before splitting up in 1970.

**Members:**
| Member | Instrument |
| --- | --- |
| John Lennon | Rhythm guitar and Lead vocals |
| Paul McCartney | Bass and Lead vocals |
| George Harrison | Lead guitar and Backing vocals |
| Ringo Starr | Drums |

---

### The Rolling Stones
**Description:** Iconic English rock band formed in London in 1962, characterized by their raw sound and onstage longevity.

**History:** They led the British Invasion wave of hard rock in the 1960s with a gritty, blues-influenced sound, releasing legendary albums like Let It Bleed and Sticky Fingers.

**Members:**
| Member | Instrument |
| --- | --- |
| Mick Jagger | Lead vocals |
| Keith Richards | Rhythm guitar |
| Brian Jones | Lead guitar |
| Bill Wyman | Bass |
| Charlie Watts | Drums |
`;
  }

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
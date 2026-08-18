const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_DIR = path.resolve(__dirname, '..', '..');
const TEST_TEMP = fs.mkdtempSync(path.join(os.tmpdir(), 'trannsform-test-'));

function run() {
  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, msg) {
    try {
      assert.strictEqual(actual, expected);
      console.log(`  PASS: ${msg}`);
      passed++;
    } catch (e) {
      console.log(`  FAIL: ${msg}`);
      console.log(`    Expected: ${JSON.stringify(expected)}`);
      console.log(`    Actual:   ${JSON.stringify(actual)}`);
      failed++;
    }
  }

  function assertTrue(actual, msg) {
    assertEqual(actual, true, msg);
  }

  function assertMatch(actual, regex, msg) {
    try {
      assert.ok(regex.test(actual), msg);
      console.log(`  PASS: ${msg}`);
      passed++;
    } catch (e) {
      console.log(`  FAIL: ${msg}`);
      console.log(`    Expected match: ${regex}`);
      console.log(`    Actual:        ${actual}`);
      failed++;
    }
  }

  try {
    delete require.cache[require.resolve('../../scripts/scanner')];
    const scanner = require('../../scripts/scanner');

    // Test 1: EXT_LABELS contains expected formats
    assertEqual(scanner.EXT_LABELS['.txt'], 'txt', 'EXT_LABELS .txt');
    assertEqual(scanner.EXT_LABELS['.md'], 'md', 'EXT_LABELS .md');
    assertEqual(scanner.EXT_LABELS['.csv'], 'csv', 'EXT_LABELS .csv');
    assertEqual(scanner.EXT_LABELS['.json'], 'json', 'EXT_LABELS .json');
    assertEqual(scanner.EXT_LABELS['.html'], 'html', 'EXT_LABELS .html');
    assertEqual(scanner.EXT_LABELS['.docx'], 'docx', 'EXT_LABELS .docx');
    assertEqual(scanner.EXT_LABELS['.pdf'], 'pdf', 'EXT_LABELS .pdf');
    assertEqual(scanner.EXT_LABELS['.xlsx'], 'xlsx', 'EXT_LABELS .xlsx');
    assertEqual(scanner.EXT_LABELS['.png'], 'png', 'EXT_LABELS .png');

    // Test 2: detectFormats returns empty for non-existent dir
    const noDir = scanner.detectFormats(path.join(TEST_TEMP, 'nonexistent'));
    assertEqual(Object.keys(noDir).length, 0, 'detectFormats returns empty for missing dir');

    // Test 3: detectFormats detects file formats
    const srcDir = path.join(TEST_TEMP, 'source');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'doc.txt'), 'hello');
    fs.writeFileSync(path.join(srcDir, 'data.csv'), 'a,b');
    fs.writeFileSync(path.join(srcDir, 'notes.md'), '# Notes');
    fs.writeFileSync(path.join(srcDir, 'image.png'), 'fake-png');

    const detected = scanner.detectFormats(srcDir);
    assertEqual(detected['.txt'], 1, 'detectFormats finds .txt');
    assertEqual(detected['.csv'], 1, 'detectFormats finds .csv');
    assertEqual(detected['.md'], 1, 'detectFormats finds .md');
    assertEqual(detected['.png'], 1, 'detectFormats finds .png');

    // Test 4: getSupportedFormats returns string
    const formats = scanner.getSupportedFormats();
    assertTrue(formats.includes('txt'), 'getSupportedFormats includes txt');
    assertTrue(formats.includes('docx'), 'getSupportedFormats includes docx');

    // Test 5: isDepInstalled for built-in modules
    assertTrue(scanner.isDepInstalled('fs'), 'isDepInstalled finds built-in fs');
    assertTrue(scanner.isDepInstalled('path'), 'isDepInstalled finds built-in path');

    // Test 6: computeFileHash returns consistent SHA-256
    const testFile = path.join(TEST_TEMP, 'hash-test.txt');
    fs.writeFileSync(testFile, 'hello world', 'utf8');
    const hash1 = scanner.computeFileHash(testFile);
    const hash2 = scanner.computeFileHash(testFile);
    assertEqual(hash1, hash2, 'computeFileHash is consistent');
    assertEqual(hash1.length, 64, 'computeFileHash returns 64-char hex');

    // Test 7: generateSourceFrontmatter produces the canonical flat schema (no nesting, no source_id)
    const fm = scanner.generateSourceFrontmatter(testFile, testFile, 'sources/original/hash-test.txt', 'sources/processed/hash-test.txt');
    assertTrue(fm.startsWith('---\n'), 'frontmatter starts with ---');
    assertTrue(fm.includes('source_file: "sources/original/hash-test.txt"'), 'frontmatter includes flat source_file');
    assertTrue(fm.includes('processed_file: "sources/processed/hash-test.txt"'), 'frontmatter includes flat processed_file');
    assertMatch(fm, /\nsha256_original: "[a-f0-9]{64}"\n/, 'frontmatter includes flat sha256_original');
    assertMatch(fm, /\nsha256_processed: "[a-f0-9]{64}"\n/, 'frontmatter includes flat sha256_processed');
    assertMatch(fm, /\nsize_bytes: \d+\n/, 'frontmatter includes flat size_bytes');
    assertMatch(fm, /\nnormalized_at: "[^"]+"\n/, 'frontmatter includes normalized_at');
    assertMatch(fm, /\nnormalized_by: "traNNsform v[^"]+"\n/, 'frontmatter includes normalized_by');
    assertTrue(!fm.includes('source:\n'), 'frontmatter is NOT nested under a "source:" key');
    assertTrue(!/source_id/.test(fm), 'frontmatter does not include source_id');
    assertTrue(!/src-\d{3}/.test(fm), 'frontmatter does not include a src-NNN id');

    const fmKeys = fm.match(/^---\n([\s\S]*?)\n---/)[1]
      .split('\n')
      .map((l) => l.split(':')[0].trim())
      .filter(Boolean);
    assertEqual(
      fmKeys.join(','),
      ['source_file', 'processed_file', 'sha256_original', 'sha256_processed', 'size_bytes', 'normalized_at', 'normalized_by'].join(','),
      'frontmatter has exactly the canonical flat keys, in order, when no web-import extras are given'
    );

    // Test 8: generateSourceFrontmatter merges optional web-import extras
    const fmWeb = scanner.generateSourceFrontmatter(testFile, testFile, 'sources/original/page.html', 'sources/processed/page.html', {
      source_url: 'https://example.com/page',
      downloaded_at: '2026-08-02T13:30:00.000Z',
      title: 'Example Page',
      description: 'A description with "quotes"',
      author: 'Jane Doe',
    });
    assertTrue(fmWeb.includes('source_url: "https://example.com/page"'), 'frontmatter includes source_url when provided');
    assertTrue(fmWeb.includes('downloaded_at: "2026-08-02T13:30:00.000Z"'), 'frontmatter includes downloaded_at when provided');
    assertTrue(fmWeb.includes('title: "Example Page"'), 'frontmatter includes title when provided');
    assertTrue(fmWeb.includes('author: "Jane Doe"'), 'frontmatter includes author when provided');
    assertTrue(fmWeb.includes('description: "A description with \\"quotes\\""'), 'frontmatter escapes quotes in optional string values');

    // Test 9: no source registry / no src-NNN assignment exported (system removed)
    assertEqual(typeof scanner.generateSourceRegistry, 'undefined', 'generateSourceRegistry no longer exists');
    assertEqual(typeof scanner.flattenOriginalToRaw, 'undefined', 'flattenOriginalToRaw no longer exists');

    // Test 9b: sanitizeMarkdownBody (Feature A)
    assertEqual(
      scanner.sanitizeMarkdownBody('a\n\n\n\n\nb'),
      'a\n\nb',
      'sanitizeMarkdownBody collapses 2+ consecutive blank lines to exactly 1'
    );
    assertEqual(
      scanner.sanitizeMarkdownBody('line with trailing spaces   \nand tabs\t\t\n'),
      'line with trailing spaces\nand tabs',
      'sanitizeMarkdownBody trims trailing whitespace from every line'
    );
    assertEqual(
      scanner.sanitizeMarkdownBody('a\r\nb\rc\r\n'),
      'a\nb\nc',
      'sanitizeMarkdownBody normalizes CRLF and lone CR to \\n'
    );
    assertEqual(
      scanner.sanitizeMarkdownBody('\n\n\nHello\n\n\n'),
      'Hello',
      'sanitizeMarkdownBody trims leading/trailing blank lines from the whole body'
    );

    const fenceInput =
      'Intro text.\n\n\n\n```python\ndef f():\n\n\n    x = 1   \n    return x\n```\n\n\n\nOutro text.';
    const fenceOutput = scanner.sanitizeMarkdownBody(fenceInput);
    assertTrue(
      fenceOutput.includes('```python\ndef f():\n\n\n    x = 1   \n    return x\n```'),
      'sanitizeMarkdownBody leaves fenced code block content byte-identical (blank lines and trailing spaces preserved)'
    );
    assertTrue(
      fenceOutput.startsWith('Intro text.\n\n') && !fenceOutput.startsWith('Intro text.\n\n\n'),
      'sanitizeMarkdownBody still collapses blank runs outside the fence'
    );
    assertEqual(
      scanner.sanitizeMarkdownBody(fenceOutput),
      fenceOutput,
      'sanitizeMarkdownBody is idempotent: sanitize(sanitize(x)) === sanitize(x)'
    );
    assertEqual(
      scanner.sanitizeMarkdownBody(scanner.sanitizeMarkdownBody('a\n\n\n\nb   \r\n\r\n\r\n')),
      scanner.sanitizeMarkdownBody('a\n\n\n\nb   \r\n\r\n\r\n'),
      'sanitizeMarkdownBody is idempotent on a mixed CRLF/blank-run/trailing-ws input'
    );

    // Test 9c: ensureHeading synthetic top-level heading fallback (Feature B)
    assertEqual(
      scanner.ensureHeading('Just plain content, no heading.', 'meeting_notes'),
      '# Meeting Notes\n\nJust plain content, no heading.',
      'ensureHeading inserts a synthetic top-level heading when the body has none'
    );
    assertEqual(
      scanner.ensureHeading('# Already Titled\n\nBody text.', 'meeting_notes'),
      '# Already Titled\n\nBody text.',
      'ensureHeading leaves the body untouched when it already has a heading'
    );

    // Test 10: scanAndProcess mirrors sources/original/ subfolders into sources/nn/ (no flattening)
    const projDir = path.join(TEST_TEMP, 'mirror-project');
    const originalDir = path.join(projDir, 'sources', 'original');
    fs.mkdirSync(path.join(originalDir, 'clientA', 'nested'), { recursive: true });
    fs.mkdirSync(path.join(originalDir, 'clientB'), { recursive: true });
    fs.writeFileSync(path.join(originalDir, 'root.txt'), 'Root level document.', 'utf8');
    fs.writeFileSync(path.join(originalDir, 'clientA', 'report.txt'), 'Client A report.', 'utf8');
    fs.writeFileSync(path.join(originalDir, 'clientA', 'nested', 'deep.txt'), 'Deeply nested document.', 'utf8');
    fs.writeFileSync(path.join(originalDir, 'clientB', 'notes.txt'), 'Client B notes.', 'utf8');

    return scanner.scanAndProcess(projDir, { autoAcceptPrompt: true }).then((result) => {
      const processedDir = path.join(projDir, 'sources', 'processed');
      const nnDir = path.join(projDir, 'sources', 'nn');

      assertEqual(result.totalDiscovered, 4, 'scanAndProcess discovers all files across subfolders');
      assertEqual(result.processedCount, 4, 'scanAndProcess processes all plain-text files');

      assertTrue(fs.existsSync(path.join(processedDir, 'root.txt')), 'root-level file copied in sources/processed');
      assertTrue(fs.existsSync(path.join(nnDir, 'root.md')), 'root-level file normalized at sources/nn/root.md');
      assertTrue(fs.existsSync(path.join(nnDir, 'clientA', 'report.md')), 'clientA/report.md mirrors sources/original/clientA/');
      assertTrue(fs.existsSync(path.join(nnDir, 'clientA', 'nested', 'deep.md')), 'clientA/nested/deep.md mirrors nested subfolders');
      assertTrue(fs.existsSync(path.join(nnDir, 'clientB', 'notes.md')), 'clientB/notes.md mirrors sources/original/clientB/');
      assertTrue(!fs.existsSync(path.join(nnDir, 'clientA__report.md')), 'output is not flattened with __ separators');

      const nestedContent = fs.readFileSync(path.join(nnDir, 'clientA', 'nested', 'deep.md'), 'utf8');
      assertTrue(
        nestedContent.includes('source_file: "sources/original/clientA/nested/deep.txt"'),
        'nested file frontmatter records the full sources/original/ relative path'
      );

      assertTrue(!fs.existsSync(path.join(projDir, 'sources', 'raw')), 'sources/raw/ is never created by scanAndProcess');

      // Test 10b: root.txt has no heading in its raw content -> scanner auto-inserts a
      // synthetic top-level heading so the normalized source always has a citable section.
      const rootBody = fs.readFileSync(path.join(nnDir, 'root.md'), 'utf8').replace(/^---\n[\s\S]*?\n---\n\n?/, '');
      assertTrue(rootBody.startsWith('# Root\n\n'), 'heading-less root.txt gets a synthetic "# Root" heading inserted by the scanner');
      assertTrue(rootBody.includes('Root level document.'), 'original content is preserved after the synthetic heading');

      // Cleanup
      fs.rmSync(TEST_TEMP, { recursive: true, force: true });
      console.log(`\n  Scanner tests: ${passed} passed, ${failed} failed`);
      return { passed, failed };
    });
  } catch (e) {
    fs.rmSync(TEST_TEMP, { recursive: true, force: true });
    console.error(`  ERROR: ${e.message}`);
    console.error(e.stack);
    failed++;
    return Promise.resolve({ passed, failed });
  }
}

module.exports = { run };

if (require.main === module) {
  Promise.resolve(run()).then((result) => {
    process.exit(result.failed > 0 ? 1 : 0);
  });
}

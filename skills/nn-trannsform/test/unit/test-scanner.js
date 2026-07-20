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
      assertMatch.regex ??= new RegExp(regex);
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
    assertEqual(scanner.EXT_LABELS['.docx'], 'docx', 'EXT_LABELS .docx');
    assertEqual(scanner.EXT_LABELS['.pdf'], 'pdf', 'EXT_LABELS .pdf');
    assertEqual(scanner.EXT_LABELS['.xlsx'], 'xlsx', 'EXT_LABELS .xlsx');

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
    assertEqual(detected['.png'], undefined, 'detectFormats ignores .png');

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

    // Test 7: generateSourceFrontmatter produces valid YAML
    const fm = scanner.generateSourceFrontmatter(testFile, 'raw/hash-test.txt');
    assertTrue(fm.startsWith('---\n'), 'frontmatter starts with ---');
    assertTrue(fm.includes('sha256:'), 'frontmatter includes sha256');
    assertTrue(fm.includes('raw/hash-test.txt'), 'frontmatter includes relative path');

    // Test 8: generateSourceRegistry returns empty for missing dir
    const reg = scanner.generateSourceRegistry(path.join(TEST_TEMP, 'no-md'));
    assertEqual(Array.isArray(reg), true, 'generateSourceRegistry returns array');
    assertEqual(reg.length, 0, 'generateSourceRegistry returns empty for missing dir');

    // Test 9: generateSourceRegistry from md files
    const mdDir = path.join(TEST_TEMP, 'md');
    fs.mkdirSync(mdDir, { recursive: true });
    fs.writeFileSync(path.join(mdDir, 'doc.md'), `---
source:
  file: "raw/doc.txt"
  hash: "sha256:abc"
  size: 123
  normalized_at: "2024-01-01"
  normalized_by: "traNNsform"
---

# Doc
Content`, 'utf8');

    const reg2 = scanner.generateSourceRegistry(mdDir);
    assertEqual(reg2.length, 1, 'generateSourceRegistry finds one source');
    assertEqual(reg2[0].id, 'src-001', 'generateSourceRegistry assigns src-001');

    // Cleanup
    fs.rmSync(TEST_TEMP, { recursive: true, force: true });

    console.log(`\n  Scanner tests: ${passed} passed, ${failed} failed`);
  } catch (e) {
    fs.rmSync(TEST_TEMP, { recursive: true, force: true });
    console.error(`  ERROR: ${e.message}`);
    console.error(e.stack);
    failed++;
  }

  return { passed, failed };
}

module.exports = { run };

if (require.main === module) {
  const result = run();
  process.exit(result.failed > 0 ? 1 : 0);
}

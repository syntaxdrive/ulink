import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as inkjs from 'inkjs/full';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Stories to compile: [source .ink, destination .json]
const stories = [
  ['src/stories/ui_exam_chaos.ink', 'public/stories/ui_exam_chaos.json'],
  ['src/stories/wifi_outage.ink', 'public/stories/wifi_outage.json'],
  ['src/stories/mutant_outbreak.ink', 'public/stories/mutant_outbreak.json'],
];

const Compiler = inkjs.Compiler;

for (const [src, dest] of stories) {
  const srcPath = join(root, src);
  const destPath = join(root, dest);

  try {
    const inkSource = readFileSync(srcPath, 'utf-8');
    const compiler = new Compiler(inkSource, {
      errorHandler: (message, errorType) => {
        console.error(`[${errorType}] ${message}`);
      }
    });
    const story = compiler.Compile();
    if (!story) {
        throw new Error("Compilation returned null (syntax errors present)");
    }
    const json = story.ToJson();
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, json, 'utf-8');
    console.log(`✅  Compiled: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`❌  Failed to compile ${src}:`, err.message);
    process.exit(1);
  }
}

console.log('\nAll stories compiled successfully!');

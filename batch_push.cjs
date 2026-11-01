const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

function getStatus() {
  const out = execSync('git status -s', { encoding: 'utf8' });
  const lines = out.split('\n').filter(l => l.trim().length > 0);
  const files = [];
  for (const line of lines) {
    const rawPath = line.substring(3).trim().replace(/^"|"$/g, '');
    files.push(rawPath);
  }
  return files;
}

const allFiles = getStatus();
console.log(`Total files to commit: ${allFiles.length}`);

// Group files into small batches of ~15-20MB max
const BATCH_SIZE_LIMIT = 20 * 1024 * 1024; // 20 MB

let currentBatch = [];
let currentBatchSize = 0;
const batches = [];

for (const file of allFiles) {
  let size = 0;
  try {
    size = fs.statSync(file).size;
  } catch (e) {
    size = 0; // deleted file
  }

  if (currentBatch.length > 0 && (currentBatchSize + size > BATCH_SIZE_LIMIT || currentBatch.length >= 8)) {
    batches.push(currentBatch);
    currentBatch = [file];
    currentBatchSize = size;
  } else {
    currentBatch.push(file);
    currentBatchSize += size;
  }
}
if (currentBatch.length > 0) {
  batches.push(currentBatch);
}

console.log(`Divided into ${batches.length} safe batches.`);

for (let i = 0; i < batches.length; i++) {
  const batch = batches[i];
  console.log(`\n=== Processing Batch ${i + 1} / ${batches.length} (${batch.length} files) ===`);
  for (const f of batch) {
    run(`git add "${f}"`);
  }
  run(`git commit -m "feat: sync media assets batch ${i + 1}/${batches.length}"`);
  
  let pushed = false;
  let attempts = 0;
  while (!pushed && attempts < 3) {
    attempts++;
    try {
      console.log(`Pushing batch ${i + 1}... (attempt ${attempts})`);
      run('git push origin main');
      pushed = true;
    } catch (err) {
      console.warn(`Push failed on attempt ${attempts}, retrying in 3s...`);
      execSync('timeout /t 3 /nobreak >nul 2>&1');
    }
  }
  if (!pushed) {
    console.error(`Failed to push batch ${i + 1} after 3 attempts. Aborting.`);
    process.exit(1);
  }
  console.log(`Batch ${i + 1} successfully pushed to GitHub!`);
}

console.log('\nAll media assets successfully pushed to GitHub!');

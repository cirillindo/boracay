const fs = require('fs');
const path = require('path');

const targetDir = process.cwd(); // Start from the current working directory (project root)
const excludeDirs = ['node_modules', 'dist', '.git', '.bolt', 'public']; // Directories to exclude

const fileSizes = [];

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function traverseDir(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        traverseDir(filePath);
      }
    } else {
      fileSizes.push({
        path: path.relative(targetDir, filePath), // Get path relative to project root
        size: stat.size
      });
    }
  }
}

console.log('Scanning project for file sizes...');
try {
  traverseDir(targetDir);

  // Sort files by size in descending order
  fileSizes.sort((a, b) => b.size - a.size);

  console.log('\n--- Top 20 Largest Files ---');
  for (let i = 0; i < Math.min(fileSizes.length, 20); i++) {
    const file = fileSizes[i];
    console.log(`${formatBytes(file.size).padStart(10)}  ${file.path}`);
  }

  console.log('\nScan complete.');
} catch (error) {
  console.error('An error occurred during scanning:', error.message);
}

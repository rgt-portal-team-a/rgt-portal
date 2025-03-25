const fs = require("fs");
const path = require("path");


function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function copyFiles(srcDir, destDir, extensions) {
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory ${srcDir} does not exist`);
    return;
  }

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(srcDir);

  files.forEach((file) => {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyFiles(srcPath, destPath, extensions);
    } else if (extensions.includes(path.extname(file))) {
      ensureDirectoryExistence(destPath);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

copyFiles(
  "src",
  "dist",
  [".html", ".css", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".json"], 
);

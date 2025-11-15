const fs = require("fs");
const path = require("path");

const exts = [".js", ".jsx", ".ts", ".tsx"];

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".turbo",
  "dist",
  "build",
]);

function shouldProcessFile(filePath) {
  return exts.includes(path.extname(filePath));
}

function shouldSkipDir(dirName) {
  return IGNORE_DIRS.has(dirName);
}

function fixContent(content) {
  let fixed = content;

  // Fix escaped use directives like \"use client\"
  fixed = fixed.replace(/\\"use client\\";?/g, '"use client";');
  fixed = fixed.replace(/\\"use server\\";?/g, '"use server";');

  // Also handle cases without semicolons just in case
  fixed = fixed.replace(/\\"use client\\"/g, '"use client"');
  fixed = fixed.replace(/\\"use server\\"/g, '"use server"');

  return fixed;
}

function walk(dir, fileCallback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) {
        walk(fullPath, fileCallback);
      }
    } else if (entry.isFile() && shouldProcessFile(fullPath)) {
      fileCallback(fullPath);
    }
  }
}

function main() {
  const root = process.cwd();
  console.log(` Scanning for escaped "use client"/"use server" in: ${root}`);

  const changedFiles = [];

  walk(root, (filePath) => {
    const original = fs.readFileSync(filePath, "utf8");
    const fixed = fixContent(original);

    if (fixed !== original) {
      fs.writeFileSync(filePath, fixed, "utf8");
      changedFiles.push(filePath);
    }
  });

  if (changedFiles.length === 0) {
    console.log(" No escaped use directives found. Nothing changed.");
  } else {
    console.log(" Fixed escaped use directives in:");
    for (const f of changedFiles) {
      console.log("  - " + path.relative(root, f));
    }
  }
}

main();

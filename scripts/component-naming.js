import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const VALID_EXT = [".tsx", ".jsx"];

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath));
    } else {
      if (VALID_EXT.includes(path.extname(file))) {
        results.push(filePath);
      }
    }
  });

  return results;
}

function extractComponentName(content) {
  const regex1 = /export\s+function\s+([A-Z][A-Za-z0-9_]*)/;
  const match1 = content.match(regex1);
  if (match1) return match1[1];

  const regex2 = /export\s+default\s+function\s+([A-Z][A-Za-z0-9_]*)/;
  const match2 = content.match(regex2);
  if (match2) return match2[1];

  return null;
}

console.log("🚀 Checking component naming consistency...\n");

const files = getAllFiles(projectRoot);
let issues = [];

files.forEach((file) => {
  const fileName = path.basename(file, path.extname(file));
  const fileContent = fs.readFileSync(file, "utf8");

  const componentName = extractComponentName(fileContent);

  if (!componentName) return;

  if (componentName !== fileName) {
    issues.push({
      file,
      fileName,
      componentName,
      type: "NAME_MISMATCH",
      message: `Component name '${componentName}' does not match file name '${fileName}'.`
    });
  }
});

if (issues.length === 0) {
  console.log("✅ No issues found. All component names match their file names.");
} else {
  console.log("❌ Issues detected:\n");

  issues.forEach((issue, index) => {
    console.log(
      `${index + 1}) ${issue.type}\n   FILE: ${issue.file}\n   COMPONENT: ${issue.componentName}\n   FILE NAME: ${issue.fileName}\n   → ${issue.message}\n`
    );
  });

  console.log(`🔥 Total issues: ${issues.length}`);
}

console.log("\n✔ Scan complete.");

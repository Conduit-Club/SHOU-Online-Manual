import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve("docs");
const documents = [];

function collectMarkdownFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(entryPath);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      documents.push(entryPath);
    }
  }
}

function readFrontMatter(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? null;
}

function readScalar(frontMatter, key) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(?:["']([^"']+)["']|([^\\s#]+))\\s*(?:#.*)?$`, "m"));
  return match?.[1] ?? match?.[2] ?? "";
}

collectMarkdownFiles(docsRoot);

const errors = [];
const ids = new Map();

for (const filePath of documents.sort()) {
  const relativePath = path.relative(process.cwd(), filePath);
  const frontMatter = readFrontMatter(filePath);

  if (frontMatter === null) {
    errors.push(`${relativePath}: missing front matter`);
    continue;
  }

  if (readScalar(frontMatter, "comments").toLowerCase() === "false") {
    continue;
  }

  const commentId = readScalar(frontMatter, "comment_id");
  if (!commentId) {
    errors.push(`${relativePath}: comment_id is required unless comments: false`);
    continue;
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(commentId)) {
    errors.push(`${relativePath}: invalid comment_id "${commentId}"`);
  }

  const previousPath = ids.get(commentId);
  if (previousPath) {
    errors.push(`${relativePath}: duplicate comment_id "${commentId}" (also used by ${previousPath})`);
  } else {
    ids.set(commentId, relativePath);
  }
}

if (errors.length > 0) {
  console.error("Comment metadata validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Validated ${ids.size} document comment IDs.`);
}

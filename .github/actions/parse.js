import { promises as fs } from "fs";
import postToDevTo from "./devto.js";
import postToHashnode from "./hashnode.js";
import postToMedium from "./medium.js";

const getFrontMatterAndBody = (markdown) => {
  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---\s*([\s\S]*)/;
  const matched = markdown.match(charactersBetweenGroupedHyphens);

  if (!matched) {
    return { frontmatter: {}, body: markdown };
  }

  const metadata = matched[1];
  const body = matched[2];

  const metadataLines = metadata.split("\n");
  const frontmatter = metadataLines.reduce((accumulator, line) => {
    const [key, ...value] = line.split(":").map((part) => part.trim());

    if (key)
      accumulator[key] = value.length > 1 ? value.join(":") : value.join("");
    return accumulator;
  }, {});

  return { frontmatter, body };
};

async function postToBlogs(filePath) {
  process.stdout.write("Starting parse function\n"); // Debugging statement

  // Read the markdown file
  const content = await fs.readFile(filePath, "utf8");
  process.stdout.write("File read successfully\n"); // Debugging statement
  process.stdout.write(`File content:\n${content}\n`); // Debugging statement

  // Extract the front matter and body from the markdown file
  const { frontmatter, body } = getFrontMatterAndBody(content);
  process.stdout.write(
    `Extracted frontmatter: ${JSON.stringify(frontmatter, null, 2)}\n`
  ); // Debugging statement
  process.stdout.write(`Extracted body:\n${body}\n`); // Debugging statement

  await postToDevTo(frontmatter, body);
  await postToHashnode(frontmatter, body);
  await postToMedium(frontmatter, body);

  process.stdout.write("Request ended\n"); // Debugging statement
}

// Get the file path from command line arguments
const filePath = process.argv[2];
process.stdout.write(`File path provided: ${filePath}\n`); // Debugging statement

if (!filePath) {
  process.stderr.write("No file path provided\n"); // Debugging statement
  process.stderr.write("Please provide a file path\n");
  process.exit(1);
}

postToBlogs(filePath);

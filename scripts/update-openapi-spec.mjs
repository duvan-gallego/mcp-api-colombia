import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceUrl = 'https://api-colombia.com/swagger/v1/swagger.json';
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, '../openapi/api-colombia.v1.json');
const temporaryPath = `${outputPath}.tmp`;

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(
    `Unable to download OpenAPI specification: ${response.status} ${response.statusText}`
  );
}

const specification = await response.text();
JSON.parse(specification);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(temporaryPath, specification);
await rename(temporaryPath, outputPath);

console.log(`Updated ${outputPath}`);

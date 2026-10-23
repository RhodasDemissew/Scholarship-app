import { writeFile } from 'node:fs/promises';
import openapiTS, { astToString } from 'openapi-typescript';

const response = await fetch('http://127.0.0.1:5080/openapi/v1.json');
if (!response.ok) throw new Error(`OpenAPI request failed: ${response.status}`);
const schema = await response.json();
const types = astToString(await openapiTS(schema));
await writeFile(new URL('../openapi.json', import.meta.url), JSON.stringify(schema, null, 2) + '\n');
await writeFile(new URL('../src/lib/api.generated.ts', import.meta.url), types);
console.log('Updated OpenAPI snapshot and generated TypeScript contracts.');

import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'openapi/api-colombia.v1.json',
  output: 'src/client/generated',
});

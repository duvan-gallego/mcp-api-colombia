import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'https://api-colombia.com/swagger/v1/swagger.json',
  output: 'src/client/generated',
});

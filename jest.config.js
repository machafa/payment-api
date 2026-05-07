export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // IMPORTANTE: Isto carrega o teu ficheiro .env antes de rodar qualquer teste
  setupFiles: ['dotenv/config'], 
  testMatch: [
    "**/src/tests/**/*_test.ts" 
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    // Resolve o problema dos imports .js no TypeScript
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // gets the env to any route you want
  setupFiles: ['dotenv/config,'
    ['./src/tests/setup.ts']
  ], 
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
  '^(\\.{1,2}/.*)\\.js$': '$1',
},
};
/**
 * Jest config for shade-app.
 *
 * `node` env keeps cold start fast for unit tests that don't render RN components.
 * Switch to `jest-expo` preset's default (jsdom) only when we add screen tests
 * with @testing-library/react-native.
 */
/**
 * jest-expo/node skips the native-only setup that pulls expo-modules-core
 * sources (which Jest cannot parse out of the box). Plenty for unit tests
 * on lib/ that only touch logger / fetch / nacl / bs58.
 *
 * Switch to `preset: 'jest-expo'` and add @testing-library/react-native if /
 * when screen-level tests are added.
 */
module.exports = {
  preset: 'jest-expo/node',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    '!lib/**/*.d.ts',
  ],
};

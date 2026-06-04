module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  moduleNameMapper: {
    '.*middleware/auth$': '<rootDir>/tests/mockAuth.js',
  },
};

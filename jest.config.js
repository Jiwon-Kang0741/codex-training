module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': '<rootDir>/ts-jest.js',
  },
  moduleNameMapper: {
    '^@testing-library/react$': '<rootDir>/test-utils/testing-library-react.ts',
    '^@testing-library/user-event$': '<rootDir>/test-utils/user-event.ts',
    '^@testing-library/jest-dom$': '<rootDir>/test-utils/jest-dom.ts',
    '\\.(css|less|scss)$': '<rootDir>/test-utils/style-mock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/crm-ai/'],
};

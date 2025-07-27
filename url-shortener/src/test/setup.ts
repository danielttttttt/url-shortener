import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {},
  auth: {},
}))

// Mock environment
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
}

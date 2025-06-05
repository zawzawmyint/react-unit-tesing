// Extend Jest matchers with testing-library assertions
import "@testing-library/jest-dom";

// Mock window.matchMedia (needed for some UI libraries)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Global test utilities
global.testUtils = {
  // Helper to create mock functions with common patterns
  createMockFunction: (returnValue) => jest.fn().mockReturnValue(returnValue),

  // Helper to wait for multiple async operations
  waitForAll: (promises) => Promise.all(promises),
};

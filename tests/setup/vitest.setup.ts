// Vitest global setup
import { beforeEach, vi } from 'vitest';
import { installChromeMock } from './chrome-mock';

// Install Chrome mock before each test
beforeEach(() => {
  installChromeMock();
});

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

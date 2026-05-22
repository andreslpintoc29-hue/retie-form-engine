// ============================================
// TEST SETUP - Global mocks and utilities
// ============================================

import { vi } from 'vitest';

// Mock IndexedDB
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

global.indexedDB = indexedDB as any;

// Mock window
global.window = {
  indexedDB: indexedDB as any,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  location: { href: 'http://localhost' },
  navigator: { 
    userAgent: 'test-agent',
    onLine: true,
    connection: { type: 'wifi' }
  }
} as any;

// Mock document
global.document = {
  createElement: vi.fn(),
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
} as any;

// Mock crypto safely using defineProperty to handle read-only property in modern Node versions
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `test-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    }
  },
  configurable: true,
  writable: true
});

// Silence console in tests (optional)
export const silenceConsole = () => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
};

export const restoreConsole = () => {
  vi.restoreAllMocks();
};

// Test utilities
export const createMockEvent = (type: string, payload: any = {}) => ({
  id: `evt-${Date.now()}`,
  type,
  timestamp: new Date().toISOString(),
  source: 'test',
  payload,
  metadata: {}
});

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  
  return { promise, resolve, reject };
};
import React from 'react';

class LocalStorageMock {
  private store: Record<string, string>;

  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

Object.defineProperty(global, 'localStorage', { value: new LocalStorageMock() });

// React 18 act() support
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Simple mock for next/dynamic to synchronously require modules
jest.mock('next/dynamic', () => {
  return (loader: any) => {
    const match = /import\(['"]([^'"]+)['"]\)/.exec(loader.toString());
    const mod = match ? require(match[1]) : { default: () => null };
    const Comp = mod.default || mod;
    return (props: any) => React.createElement(Comp, props);
  };
});

// Stub the markdown editor used in components
jest.mock('@uiw/react-md-editor', () => ({
  __esModule: true,
  default: (props: any) =>
    React.createElement('textarea', {
      value: props.value,
      onChange: (e: any) => props.onChange?.(e.target.value),
      'data-testid': 'notes',
    }),
  commands: {},
}));

// Provide fetch primitives if not available
if (typeof global.Request === 'undefined') {
  Object.assign(global, {
    Request: globalThis.Request,
    Response: globalThis.Response,
    Headers: globalThis.Headers,
    fetch: globalThis.fetch,
  });
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';

export function render(ui: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => { root.render(ui); });
  return {
    container,
    unmount: () => { act(() => root.unmount()); container.remove(); },
    rerender: (ui2: React.ReactElement) => act(() => root.render(ui2)),
  };
}

export const fireEvent = {
  change: (elem: HTMLElement, value: string) => {
    act(() => {
      (elem as HTMLInputElement).value = value;
      elem.dispatchEvent(new Event('input', { bubbles: true }));
      elem.dispatchEvent(new Event('change', { bubbles: true }));
    });
  },
  click: (elem: HTMLElement) => {
    act(() => {
      elem.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  },
};

function queryByText(text: string, element: HTMLElement = document.body): HTMLElement | null {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if ((node as HTMLElement).textContent?.includes(text)) {
      return node as HTMLElement;
    }
  }
  return null;
}

export const screen = {
  getByText: (text: string) => {
    const el = queryByText(text);
    if (!el) throw new Error(`Text ${text} not found`);
    return el;
  },
  queryByText: (text: string) => queryByText(text),
  getByPlaceholderText: (text: string) => {
    const el = document.querySelector(`[placeholder="${text}"]`);
    if (!el) throw new Error(`Placeholder ${text} not found`);
    return el as HTMLElement;
  },
  getByTestId: (id: string) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (!el) throw new Error(`TestId ${id} not found`);
    return el as HTMLElement;
  },
};

export async function waitFor(fn: () => void, { timeout = 1000 } = {}) {
  const start = Date.now();
  while (true) {
    try {
      fn();
      return;
    } catch (err) {
      if (Date.now() - start > timeout) throw err;
      await new Promise(res => setTimeout(res, 20));
    }
  }
}

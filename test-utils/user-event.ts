import { fireEvent } from './testing-library-react';

const userEvent = {
  async type(elem: HTMLElement, text: string) {
    for (const char of text) {
      fireEvent.change(elem, (elem as HTMLInputElement).value + char);
      await Promise.resolve();
    }
  },
  click: fireEvent.click,
};

export default userEvent;

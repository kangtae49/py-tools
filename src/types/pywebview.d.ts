import type { DialogOptions } from "./models";

export {};

declare global {
  interface Window {
    pywebview: {
      api: {
        dialog_open(options?: DialogOptions): Promise<string[] | null>;

      };
    };
  }
}

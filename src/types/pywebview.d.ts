import type { DialogOptions } from "./models";

export {};

declare global {
  interface Window {
    pywebview: {
      api: {
        dialog_open(options?: DialogOptions): Promise<string[] | null>;
        get_drop_files(): Promise<DropFile[] | null>;
      },
    },

  }
}

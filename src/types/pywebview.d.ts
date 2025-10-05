import type { DialogOptions } from "./models";

export {};

declare global {
  interface Window {
    pywebview: {
      api: {
        dialog_open(options?: DialogOptions): Promise<string[] | null>
        read_file(fullpath: string): Promise<string>
        write_file(fullpath: string, content: string): Promise<void>
        app_read_file(subpath: string): Promise<string>
        app_write_file(subpath: string, content: string): Promise<void>
        app_read(subpath: string): Promise<string>
        app_write(subpath: string, content: string): Promise<void>
      },
    },

  }
}

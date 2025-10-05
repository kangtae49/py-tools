import type { DialogOptions } from "./models";

export {};

declare global {
  interface Window {
    pywebview: {
      api: {
        dialog_open(options?: DialogOptions): Promise<string[] | null>
        get_drop_files(): Promise<DropFile[] | null>
        read_to_string(fullpath: string): Promise<string>
        write_to_string(fullpath: string, content: string): Promise<void>
        app_read_to_string(subpath: string): Promise<string>
        app_write_to_string(subpath: string, content: string): Promise<void>
        app_read(subpath: string): Promise<string>
        app_write(subpath: string, content: string): Promise<void>
      },
    },

  }
}

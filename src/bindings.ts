import type {DialogOptions, DropFile} from "./types/models";
export type Result<T, E> =
  | { status: "ok"; data: T }
  | { status: "error"; error: E };


export const commands = {
  async dialog_open(options?: DialogOptions): Promise<Result<string[] | null, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.dialog_open(options) };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async get_drop_files(): Promise<Result<DropFile[] | null, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.get_drop_files() };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async read_to_string(fullpath: string): Promise<Result<string, Error>> {
    try {
      const res = await window.pywebview.api.read_to_string(fullpath);
      return { status: "ok", data: res };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async write_to_string(fullpath: string, content: string): Promise<Result<void, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.write_to_string(fullpath, content) };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async app_read_to_string(subpath: string): Promise<Result<string, Error>> {
    try {
      const res = await window.pywebview.api.app_read_to_string(subpath);
      return { status: "ok", data: res };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async app_write_to_string(subpath: string, content: string): Promise<Result<void, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.app_write_to_string(subpath, content) };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async app_read(subpath: string): Promise<Result<string, Error>> {
    try {
      const res = await window.pywebview.api.app_read(subpath);
      return { status: "ok", data: res };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async app_write(subpath: string, content: string): Promise<Result<void, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.app_write(subpath, content) };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
}

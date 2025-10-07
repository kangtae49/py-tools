import type {DialogOptions} from "./types/models";
export type Result<T, E> =
  | { status: "ok"; data: T }
  | { status: "error"; error: E };


export const commands = {
  async dialogOpen(options?: DialogOptions): Promise<Result<string[] | null, Error>> {
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
  async readFile(fullpath: string): Promise<Result<string, Error>> {
    try {
      const res = await window.pywebview.api.read_file(fullpath);
      return { status: "ok", data: res };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async writeFile(fullpath: string, content: string): Promise<Result<void, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.write_file(fullpath, content) };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async appReadFile(subpath: string): Promise<Result<string, Error>> {
    try {
      const res = await window.pywebview.api.app_read_file(subpath);
      return { status: "ok", data: res };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async appWriteFile(subpath: string, default_val: string): Promise<Result<void, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.app_write_file(subpath, default_val) };
    } catch (e: Error | any) {
      if (e?.name === 'ApiError') {
        return { status: "error", error: e  as any };
      } else {
        throw e;
      }
    }
  },
  async appRead(subpath: string): Promise<Result<string, Error>> {
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
  async appWrite(subpath: string, content: string): Promise<Result<void, Error>> {
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

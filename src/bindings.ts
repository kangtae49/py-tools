import type {DialogOptions} from "./types/models";

export type Result<T, E> =
  | { status: "ok"; data: T }
  | { status: "error"; error: E };

export type Error = { ApiError: string }

export const commands = {
  async dialog_open(options?: DialogOptions): Promise<Result<string[] | null, Error>> {
    try {
      return { status: "ok", data: await window.pywebview.api.dialog_open(options) };
    } catch (e) {
      if(e instanceof Error) throw e;
      else return { status: "error", error: e  as any };
    }
  }
}

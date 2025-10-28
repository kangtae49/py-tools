import type {Ref, RefCallback} from "react";

export const srcLocal = (fullpath: string): string =>  {
  if (import.meta.env.PROD) {
    return `${fullpath}`
  } else {
    return `/local/file?path=${encodeURIComponent(fullpath)}`
  }
}

export function getFilename(path: string) {
  return path.split(/[/\\]/).pop();
}
export function formatSeconds(seconds: number): string {
  if (!seconds) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}


export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") ref(value);
      else ref.current = value;
    });
  };
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isImage(fileNameOrExt: string | undefined): boolean {
  if (!fileNameOrExt) return false;
  const match = fileNameOrExt.toLowerCase().match(/\.([a-z0-9]+)$/);
  if (!match) return false;

  const ext = match[1];
  const validExts = [
    'jpg', 'jpeg', 'png', 'gif',
    'webp', 'bmp', 'svg', 'avif', 'ico'
  ];

  return validExts.includes(ext);
}
export const srcLocal = (fullpath: string): string =>  {
  if (import.meta.env.PROD) {
    return `file://${fullpath}`
  } else {
    return `/local/file?path=${encodeURIComponent(fullpath)}`
  }
}
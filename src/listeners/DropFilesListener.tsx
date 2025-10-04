import {useEffect} from "react";
import {useReceivedDropFilesStore} from "../stores/useReceivedDropFilesStore.ts";

export function DropFilesListener() {
  const { dropRef } = useReceivedDropFilesStore();

  useEffect(() => {
    if (dropRef?.current === null) return;
    const onDropHandler = (e: CustomEvent) => {
      console.log("drop-files:", e.detail);
      const dropFiles = e.detail;
      if (dropFiles !== null) {
        dropRef?.current?.dispatchEvent(new CustomEvent("drop-files", { detail: dropFiles}))
      }
    };
    window?.addEventListener("drop-files", onDropHandler as EventListener);
    return () => window?.removeEventListener("drop-files", onDropHandler as EventListener);
  }, [dropRef?.current])


  return null;
}

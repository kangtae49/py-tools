import {useReceivedDropFilesStore} from "../stores/useReceivedDropFilesStore.ts";
import useOnload from "@/stores/useOnload.ts";

export function DropFilesListener() {
  const {useReadyEffect} = useOnload()
  const { dropRef } = useReceivedDropFilesStore();

  useReadyEffect(() => {
    if (dropRef === null) return;
    const onDropHandler = (e: CustomEvent) => {
      console.log("drop-files:", e.detail);
      const dropFiles = e.detail;
      if (dropFiles !== null) {
        dropRef?.dispatchEvent(new CustomEvent("drop-files", { detail: dropFiles}))
      }
    };
    window?.addEventListener("drop-files", onDropHandler as EventListener);
    return () => window?.removeEventListener("drop-files", onDropHandler as EventListener);
  }, [dropRef])

  return null;
}

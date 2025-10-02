import {useEffect} from "react";
import {useReceivedDropFilesStore} from "../stores/useReceivedDropFilesStore.ts";
import type {DropFile} from "../types/models";

export function DropFilesListener() {
  const {setReceivedDropFiles} = useReceivedDropFilesStore();
  const changeDropFiles = (dropFiles: DropFile [] | null) => {
    console.log("changeDropFiles:", dropFiles);
    if (dropFiles !== null) {
      setReceivedDropFiles(dropFiles);
    }
  };

  useEffect(() => {
    (window as any).reactApi = { changeDropFiles };
  }, []);

  return null;
}

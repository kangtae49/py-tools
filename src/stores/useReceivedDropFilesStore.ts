import {create} from "zustand";
import type {DropFile} from "../types/models";

export interface ReceivedDropFilesState {
  receivedDropFiles: DropFile[] | null
  fileList: FileList | null
  setReceivedDropFiles: (dropFiles: DropFile[] | null) => void
  setFileList: (fileList: FileList | null) => void
  getDropFiles: () => DropFile[] | null
}

export const useReceivedDropFilesStore = create<ReceivedDropFilesState>((set, get) => ({
  receivedDropFiles: null,
  fileList: null,
  setReceivedDropFiles: (receivedDropFiles) => set(() => ({ receivedDropFiles })),
  setFileList: (fileList) => set(() => ({ fileList })),
  getDropFiles: () => {
    const receivedDropFiles = get().receivedDropFiles;
    const fileList = get().fileList;
    if (fileList == null) return null;
    if (receivedDropFiles == null) return null;

    const fileNames = [...fileList].map((file) => file.name);
    const dropNames = [...receivedDropFiles].map((file) => file.name);
    if (fileNames.length !== dropNames.length ) {
      return null;
    }
    function equals(a: string[], b: string[]): boolean {
      const setA = new Set(a);
      const setB = new Set(b);

      if (setA.size !== setB.size) return false;

      for (const item of setA) {
        if (!setB.has(item)) return false;
      }
      return true;
    }
    if(equals(fileNames, dropNames)) {
      const newReceivedDropFiles = [...receivedDropFiles];
      set({fileList: null});
      set({receivedDropFiles: null});
      return newReceivedDropFiles
    }
    return null;
  },

}))

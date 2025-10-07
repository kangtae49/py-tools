import {create} from "zustand";

export interface ReceivedDropFilesState {
  dropRef: HTMLDivElement | null

  setDropRef: (dropRef: HTMLDivElement | null) => void
}

export const useReceivedDropFilesStore = create<ReceivedDropFilesState>((set, _get) => ({
  dropRef: null,

  setDropRef: (dropRef) => {
    if (dropRef === null) return;
    set(() => ({dropRef}))
  },
}))

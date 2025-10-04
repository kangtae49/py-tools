import {create} from "zustand";
import type {RefObject} from "react";
// import type {DropFile} from "../types/models";

export interface ReceivedDropFilesState {
  dropRef: RefObject<HTMLDivElement | null> | null

  setDropRef: (dropRef: RefObject<HTMLDivElement | null> | null) => void
}

export const useReceivedDropFilesStore = create<ReceivedDropFilesState>((set, _get) => ({
  dropRef: null,

  setDropRef: (dropRef) => set(() => ({ dropRef })),
}))

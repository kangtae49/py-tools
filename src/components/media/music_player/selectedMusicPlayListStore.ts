import {create} from "zustand/react";

interface SelectedMusicPlayListStore {
  selectedPlayList: string[];
  selectionBegin: string | undefined;
  setSelectedPlayList: (value: string[]) => void;
  setSelectionBegin: (value: string | undefined) => void;

  appendSelectedPlayList: (value: string[]) => void;
  removeSelectedPlayList: (value: string[]) => void;
}

export const useSelectedMusicPlayListStore = create<SelectedMusicPlayListStore>((set, get) => ({
  selectedPlayList: [],
  selectionBegin: undefined,

  setSelectedPlayList: (value) => set({ selectedPlayList: value }),
  setSelectionBegin: (value) => set({ selectionBegin: value }),

  appendSelectedPlayList: (value) => {
    const newSelectedPlayList = [...new Set([...get().selectedPlayList, ...value])];
    set({ selectedPlayList: newSelectedPlayList})
  },
  removeSelectedPlayList: (value) => {
    const newSelectedPlayList = get().selectedPlayList.filter(v => !value.includes(v));
    set({ selectedPlayList: newSelectedPlayList})
  }
}));

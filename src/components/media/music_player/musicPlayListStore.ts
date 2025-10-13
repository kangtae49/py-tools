import {create} from "zustand/react";
import {type ListImperativeAPI} from 'react-window';



interface MusicPlayListStore {
  playListRef: ListImperativeAPI | null;
  setPlayListRef: (value: ListImperativeAPI | null) => void;
  scrollPlayPath: (curPlayList: string[], value: string | undefined) => void;
}

export const useMusicPlayListStore = create<MusicPlayListStore>((set, get) => ({
  playListRef: null,

  setPlayListRef: (value) => {
    if (value === null) return;
    set({playListRef: value})
  },
  scrollPlayPath: (curPlayList, value) => {
    if(value === undefined) return;
    const listRef = get().playListRef;
    const idx = curPlayList.indexOf(value);
    if (idx >= 0) {
      listRef?.scrollToRow({align:"auto", behavior: "auto", index: idx});
    }
  }
}));

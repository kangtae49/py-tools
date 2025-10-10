import {create} from "zustand/react";
import {type ListImperativeAPI} from 'react-window';



interface MoviePlayListStore {
  playListRef: ListImperativeAPI | null;
  setPlayListRef: (value: ListImperativeAPI | null) => void;
  scrollPlayPath: (curPlayList: string[], value: string) => void;
}

export const useMoviePlayListStore = create<MoviePlayListStore>((set, get) => ({
  playListRef: null,

  setPlayListRef: (value) => {
    if (value === null) return;
    set({playListRef: value})
  },
  scrollPlayPath: (curPlayList: string[], value: string) => {
    // const curPlayList = get().setting.playList;
    const listRef = get().playListRef;
    const idx = curPlayList.indexOf(value);
    if (idx >= 0) {
      listRef?.scrollToRow({align:"auto", behavior: "auto", index: idx});
    }
  }
}));

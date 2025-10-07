import {create} from "zustand/react";
import natsort from "natsort";
import {type ListImperativeAPI} from 'react-window';

export interface MusicPlayerSetting {
  playPath?: string;
  currentTime?: number;
  volume?: number;
  playbackRate?: number;
  muted?: boolean;
  paused?: boolean;
}

interface MusicPlayListStore {
  playListRef: ListImperativeAPI | null;
  playList: string[];
  playPath: string | null;

  setPlayListRef: (value: ListImperativeAPI | null) => void;
  setPlayList: (value: string[]) => void;
  setPlayPath: (value: string | null) => void;

  appendPlayList: (curList: string[], addList: string []) => string [];
  removePlayList: (curList: string[], delList: string[]) => string [];
  shufflePlayList: (curList: string[]) => string [];
  natsortPlayList: (curList: string[]) => string [];
  // prevPlayPath: () => string | null;
  // nextPlayPath: () => string | null;
  getPrevPlayPath: (value: string | null) => string | null;
  getNextPlayPath: (value: string | null) => string | null;

  scrollPlayPath: (value: string) => void;

}

export const useMusicPlayListStore = create<MusicPlayListStore>((set, get) => ({
  playListRef: null,
  playList: [],
  playPath: null,

  setPlayListRef: (value) => set({ playListRef: value }),
  setPlayList: (value) => set({ playList: value }),
  setPlayPath: (value) => set({ playPath: value }),

  appendPlayList: (curList, addList) => {
    const addNewList = addList.filter((v) => !curList.includes(v))
    return [...addNewList, ...curList];
  },
  removePlayList: (curList, delList) => {
    return [...curList.filter(v => !delList.includes(v))]
  },
  shufflePlayList: (curList) => {
    const arr = [...curList]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr
  },
  natsortPlayList: (curList) => {
    const sorter = natsort();
    return [...curList].sort(sorter);
  },
  // prevPlayPath: () => {
  //   const curPlayList = get().playList;
  //   if (curPlayList.length == 0) {
  //     return null;
  //   }
  //   let prev: string | null;
  //   const curPlayPath = get().playPath;
  //   if (curPlayPath == null) {
  //     prev = curPlayList[0];
  //     set({ playPath: prev });
  //     return prev;
  //   }
  //   let idx = curPlayList.indexOf(curPlayPath) -1;
  //   if (idx < 0) {
  //     idx = curPlayList.length - 1;
  //   }
  //   prev = curPlayList[idx]
  //   set({ playPath: prev });
  //   return prev;
  // },
  // nextPlayPath: () => {
  //   const curPlayList = get().playList;
  //   if (curPlayList.length == 0) {
  //     return null;
  //   }
  //   let next: string | null;
  //   const curPlayPath = get().playPath;
  //   if (curPlayPath == null) {
  //     next = curPlayList[0];
  //     set({ playPath: next });
  //     return next;
  //   }
  //   let idx = curPlayList.indexOf(curPlayPath) +1;
  //   if (idx > curPlayList.length -1) {
  //     idx = 0;
  //   }
  //   next = curPlayList[idx]
  //   set({ playPath: next });
  //   return next;
  // },
  getPrevPlayPath: (value) => {
    const curPlayList = get().playList;
    if (curPlayList.length == 0) {
      return null;
    }
    let prev: string | null;
    if (value == null) {
      prev = curPlayList[0];
      return prev
    }
    let idx = curPlayList.indexOf(value) -1;
    if (idx < 0) {
      idx = curPlayList.length - 1;
    }
    prev = curPlayList[idx]
    return prev;
  },
  getNextPlayPath: (value) => {
    const curPlayList = get().playList;
    if (curPlayList.length == 0) {
      return null;
    }
    let next: string | null;
    if (value == null) {
      next = curPlayList[0];
      return next;
    }
    let idx = curPlayList.indexOf(value) +1;
    if (idx > curPlayList.length -1) {
      idx = 0;
    }
    next = curPlayList[idx]
    return next;
  },
  scrollPlayPath: (value: string) => {
    const curPlayList = get().playList;
    const listRef = get().playListRef;
    const idx = curPlayList.indexOf(value);
    if (idx >= 0) {
      listRef?.scrollToRow({align:"auto", behavior: "auto", index: idx});
    }
  }
}));

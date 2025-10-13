import {create} from "zustand";
import type {ListImperativeAPI} from "react-window";
import natsort from "natsort";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'

export interface PictureSetting {
  caller?: string
  playPath?: string
  paused: boolean
  shuffle: boolean
  repeat: RepeatType
  playList?: string[]
}
interface PictureStore {
  containerRef: HTMLDivElement | null
  filter: string[]
  fullscreen: boolean
  ready: boolean
  setting: PictureSetting

  setContainerRef: (containerRef: HTMLDivElement | null) => void
  setSetting: (setting: PictureSetting | ((prev: PictureSetting) => PictureSetting)) => void;
  setFilter: (filter: string[]) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setReady: (ready: boolean) => void;


  playListRef: ListImperativeAPI | null;
  setPlayListRef: (value: ListImperativeAPI | null) => void;
  scrollPlayPath: (curPlayList: string[], value: string | undefined) => void;

  appendPlayList: (curList: string[], addList: string []) => string [];
  removePlayList: (curList: string[], delList: string[]) => string [];
  shufflePlayList: (curList: string[]) => string [];
  natsortPlayList: (curList: string[]) => string [];
  getPrevPlayPath: (value: string | undefined) => string | undefined;
  getNextPlayPath: (value: string | undefined) => string | undefined;


  selectedPlayList: string[];
  selectionBegin: string | undefined;
  setSelectedPlayList: (value: string[]) => void;
  setSelectionBegin: (value: string | undefined) => void;

  appendSelectedPlayList: (value: string[]) => void;
  removeSelectedPlayList: (value: string[]) => void;
}

export const usePictureStore = create<PictureStore>((set, get) => ({
  containerRef: null,
  playListRef: null,
  filter: ["jpg", "png", "svg", "bmp"],
  fullscreen: false,
  ready: false,
  setting: {
    paused: true,
    shuffle: true,
    repeat: "repeat_all",
    playList: []
  },

  selectedPlayList: [],
  selectionBegin: undefined,

  setContainerRef: (containerRef) => set({containerRef}),

  setSetting: (updater) => {
    set((state) => ({
      setting:
        typeof updater === "function" ? updater(state.setting) : updater,
    }))
  },
  setFilter: (filter) => set({filter}),
  setFullscreen: (fullscreen) => set({fullscreen}),
  setReady: (ready) => set({ready}),


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
  },

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
  getPrevPlayPath: (value) => {
    const curPlayList = get().setting?.playList;
    if (curPlayList === undefined) return undefined;
    if (curPlayList.length == 0) {
      return undefined;
    }
    let prev: string | undefined;
    if (value === undefined) {
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
    const curPlayList = get().setting?.playList;
    if (curPlayList === undefined) return undefined;
    if (curPlayList.length == 0) {
      return undefined;
    }
    let next: string | undefined;
    if (value == undefined) {
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

}))

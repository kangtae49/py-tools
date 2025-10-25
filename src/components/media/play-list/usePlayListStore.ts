import {create} from "zustand";
import type {ListImperativeAPI} from "react-window";
import natsort from "natsort";
import React from "react";



export interface UsePlayListStore {
  playListRef: ListImperativeAPI | null
  playPath: string | undefined
  playing: boolean
  shuffle: boolean
  playList: string[]
  checkedPlayList: string[];
  rowStep: number;
  filter: string[]


  setPlayListRef: (value: ListImperativeAPI | null) => void;
  setPlayPath: (value: string | undefined) => void;
  setPlaying: (value: boolean) => void;
  setShuffle: (value: boolean) => void;
  setPlayList: (value: string[]) => void;
  setCheckedPlayList: (value: string[]) => void;
  setFilter: (value: string[]) => void;
  setRowStep: (value: number) => void;

  scrollPlayPath: (curPlayList: string[], value: string | undefined) => void;


  appendPlayList: (curList: string[], addList: string []) => string [];
  removePlayList: (curList: string[], delList: string[]) => string [];
  shufflePlayList: (curList: string[]) => string [];
  toggleShuffle: () => void;
  natsortPlayList: (curList: string[]) => string [];
  getPrevPlayPath: (value: string | undefined, step?: number) => string | undefined;
  getNextPlayPath: (value: string | undefined, step?: number) => string | undefined;

  appendCheckedPlayList: (value: string[]) => void;
  removeCheckedPlayList: (value: string[]) => void;
  toggleAllChecked: (checked: boolean) => void;

  onKeyDownPlayList: (event: React.KeyboardEvent<HTMLDivElement>) => void;

}


function createPlayListStore(defaultState?: Partial<DefaultPlayListState>) {
  return create<UsePlayListStore>((set, get) => ({
    playListRef: null,
    playPath: undefined,
    playing: false,
    shuffle: false,
    playList: [],
    checkedPlayList: [],
    selectionBegin: undefined,
    filter: [],
    rowStep: 1,
    ...defaultState,

    setPlayListRef: (value) => {
      set({playListRef: value})
    },
    setPlayPath: (value) => set({playPath: value}),
    setPlaying: (value) => set({playing: value}),
    setShuffle: (value) => set({shuffle: value}),
    setPlayList: (value) => set({playList: value}),
    setCheckedPlayList: (value) => set({ checkedPlayList: value }),
    setFilter: (value) => set({filter: value}),
    setRowStep: (value) => set({rowStep: value}),

    scrollPlayPath: (curPlayList, value) => {
      if(value === undefined) return;
      const listRef = get().playListRef;
      const idx = curPlayList.indexOf(value);
      if (idx >= 0) {
        try {
          listRef?.scrollToRow({align:"auto", behavior: "auto", index: idx});
        } catch(e) {

        }
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
    getPrevPlayPath: (value, step=1) => {
      const curPlayList = get().playList;
      if (curPlayList === undefined) return undefined;
      if (curPlayList.length == 0) {
        return undefined;
      }
      let prev: string | undefined;
      if (value === undefined) {
        prev = curPlayList[0];
        return prev
      }
      let idx = curPlayList.indexOf(value);
      if (idx < 0) {
        idx = 0;
      } else {
        idx = idx - step
      }
      if (idx < 0) {
        idx = idx + curPlayList.length
      }
      prev = curPlayList[idx]
      return prev;
    },
    getNextPlayPath: (value, step=1) => {
      const curPlayList = get().playList;
      if (curPlayList === undefined) return undefined;
      if (curPlayList.length == 0) {
        return undefined;
      }
      let next: string | undefined;
      if (value == undefined) {
        next = curPlayList[0];
        return next;
      }
      let idx = curPlayList.indexOf(value);
      if (idx < 0) {
        idx = 0;
      } else {
        idx = idx + step
      }
      if (idx >= curPlayList.length) {
        idx = idx - curPlayList.length
      }
      next = curPlayList[idx]
      return next;
    },

    appendCheckedPlayList: (value) => {
      const newSelectedPlayList = [...new Set([...get().checkedPlayList, ...value])];
      set({ checkedPlayList: newSelectedPlayList})
    },
    removeCheckedPlayList: (value) => {
      const selectedPlayList = get().checkedPlayList;
      const setCheckedPlayList = get().setCheckedPlayList;
      setCheckedPlayList(selectedPlayList.filter(v => !value.includes(v)));
    },

    toggleAllChecked: (checked: boolean) => {
      const {
        playList,
        setCheckedPlayList
      } = get();
      if (playList.length === 0) return;
      let newPlayList: string[] = []
      if (checked) {
        newPlayList = [...playList]
      }
      setCheckedPlayList(newPlayList)
    },
    toggleShuffle: () => {
      set((state) => ({shuffle:!state.shuffle}))
    },

    onKeyDownPlayList: (e: React.KeyboardEvent<HTMLDivElement>) => {
      const {
        playPath, setPlayPath,
        playList, setPlayList,
        checkedPlayList, setCheckedPlayList,
        getPrevPlayPath, getNextPlayPath,
        scrollPlayPath,
        rowStep,
      } = get();
      e.preventDefault()
      window.getSelection()?.removeAllRanges();
      if (playList.length == 0) return;

      if (e.ctrlKey && e.key === 'a') {
        setCheckedPlayList(playList);
      } else if (e.key === "Delete") {
        setPlayList(playList.filter((path)=> !checkedPlayList.includes(path)))
        setCheckedPlayList([])
      } else if (e.key === "ArrowLeft") {
        const newPlayPath = getPrevPlayPath(playPath)
        console.log('setSetting ArrowLeft')
        setPlayPath(newPlayPath);
        scrollPlayPath(playList, newPlayPath)
      } else if (e.key === "ArrowRight") {
        const newPlayPath = getNextPlayPath(playPath)
        console.log('setSetting ArrowRight')
        setPlayPath(newPlayPath);
        scrollPlayPath(playList, newPlayPath)
      } else if (e.key === "ArrowUp") {
        const newPlayPath = getPrevPlayPath(playPath, rowStep)
        console.log('setSetting ArrowLeft')
        setPlayPath(newPlayPath);
        scrollPlayPath(playList, newPlayPath)
      } else if (e.key === "ArrowDown") {
        const newPlayPath = getNextPlayPath(playPath, rowStep)
        console.log('setSetting ArrowRight')
        setPlayPath(newPlayPath);
        scrollPlayPath(playList, newPlayPath)
      }
    }

  }))
}

interface DefaultPlayListState {
  playPath: string | undefined
  paused: boolean
  shuffle: boolean
  playList: string[]
  checkedPlayList: string[]
  selectionBegin: undefined
  filter: string[]
}

export const useMoviePlayListStore = createPlayListStore({
  playPath: undefined,
  paused: true,
  shuffle: false,
  playList: [],
  checkedPlayList: [],
  selectionBegin: undefined,
  filter: ["mp4", "webm", "mkv", "ogg"],
});

export const useMusicPlayListStore = createPlayListStore({
  playPath: undefined,
  paused: true,
  shuffle: true,
  playList: [],
  checkedPlayList: [],
  selectionBegin: undefined,
  filter: ["mp3", "wav", "ogg", "m4a", "opus", "webm"],
});

export const usePicturePlayListStore = createPlayListStore({
  playPath: undefined,
  paused: true,
  shuffle: false,
  playList: [],
  checkedPlayList: [],
  selectionBegin: undefined,
  filter: ["jpg", "png", "svg", "bmp"],
});

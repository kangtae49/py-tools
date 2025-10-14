import {create} from "zustand";
import type {ListImperativeAPI} from "react-window";
import natsort from "natsort";
import React from "react";



export interface PlayListStore {
  playListRef: ListImperativeAPI | null
  playPath: string | undefined
  paused: boolean
  shuffle: boolean
  playList: string[]
  selectedPlayList: string[];
  selectionBegin: string | undefined;


  setPlayListRef: (value: ListImperativeAPI | null) => void;
  setPlayPath: (value: string | undefined) => void;
  setPaused: (value: boolean) => void;
  setShuffle: (value: boolean) => void;
  setPlayList: (value: string[]) => void;
  setSelectedPlayList: (value: string[]) => void;
  setSelectionBegin: (value: string | undefined) => void;



  scrollPlayPath: (curPlayList: string[], value: string | undefined) => void;


  appendPlayList: (curList: string[], addList: string []) => string [];
  removePlayList: (curList: string[], delList: string[]) => string [];
  shufflePlayList: (curList: string[]) => string [];
  natsortPlayList: (curList: string[]) => string [];
  getPrevPlayPath: (value: string | undefined) => string | undefined;
  getNextPlayPath: (value: string | undefined) => string | undefined;

  appendSelectedPlayList: (value: string[]) => void;
  removeSelectedPlayList: (value: string[]) => void;

  onKeyDownPlayList: (event: React.KeyboardEvent<HTMLDivElement>) => void;

}


function createPlayListStore(defaultState?: Partial<DefaultPlayListState>) {
  return create<PlayListStore>((set, get) => ({
    playListRef: null,
    playPath: undefined,
    paused: true,
    shuffle: false,
    playList: [],
    selectedPlayList: [],
    selectionBegin: undefined,
    ...defaultState,

    setPlayListRef: (value) => {
      if (value === null) return;
      set({playListRef: value})
    },
    setPlayPath: (value) => set({playPath: value}),
    setPaused: (value) => set({paused: value}),
    setShuffle: (value) => set({shuffle: value}),
    setPlayList: (value) => set({playList: value}),
    setSelectedPlayList: (value) => set({ selectedPlayList: value }),
    setSelectionBegin: (value) => set({ selectionBegin: value }),



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
      let idx = curPlayList.indexOf(value) -1;
      if (idx < 0) {
        idx = curPlayList.length - 1;
      }
      prev = curPlayList[idx]
      return prev;
    },
    getNextPlayPath: (value) => {
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
      let idx = curPlayList.indexOf(value) +1;
      if (idx > curPlayList.length -1) {
        idx = 0;
      }
      next = curPlayList[idx]
      return next;
    },

    appendSelectedPlayList: (value) => {
      const newSelectedPlayList = [...new Set([...get().selectedPlayList, ...value])];
      set({ selectedPlayList: newSelectedPlayList})
    },
    removeSelectedPlayList: (value) => {
      const selectedPlayList = get().selectedPlayList;
      const setSelectedPlayList = get().setSelectedPlayList;
      setSelectedPlayList(selectedPlayList.filter(v => !value.includes(v)));

      // const selectionBegin = get().selectionBegin;
      // const playList = get().playList;
      // const setPlayList = get().setPlayList;
      // const removePlayList = get().removePlayList;
      // const setSelectionBegin = get().setSelectionBegin;
      //
      // const newPlayList = removePlayList(playList, selectedPlayList);
      //
      // let newSelectionBegin = selectionBegin;
      //
      // if (selectionBegin) {
      //   const beginPos = playList.indexOf(selectionBegin);
      //   if (newPlayList.indexOf(selectionBegin) < 0) {
      //     let newBeginPos = Math.max(beginPos, 0);
      //     newBeginPos = Math.min(newBeginPos, newPlayList.length - 1);
      //     newSelectionBegin = newPlayList[newBeginPos]
      //   }
      //   setSelectionBegin(newSelectionBegin)
      // }
      // setPlayList(newPlayList);
    },


    onKeyDownPlayList: (e: React.KeyboardEvent<HTMLDivElement>) => {
      const {
        playPath, setPlayPath,
        playList, setPlayList,
        selectionBegin, setSelectionBegin,
        selectedPlayList, setSelectedPlayList,
        getPrevPlayPath, getNextPlayPath,
        setPaused,
        scrollPlayPath,
        removeSelectedPlayList,
        appendSelectedPlayList,
      } = get();
      e.preventDefault()
      window.getSelection()?.removeAllRanges();
      if (playList.length == 0) return;

      if (e.ctrlKey && e.key === 'a') {
        setSelectedPlayList(playList);
      } else if (e.key === "Delete") {
        setPlayList(playList.filter((path)=> !selectedPlayList.includes(path)))
        setSelectedPlayList([])
      } else if (e.key === "ArrowLeft") {
        const newPlayPath = getPrevPlayPath(playPath)
        console.log('setSetting ArrowLeft')
        // setSetting((setting) => ({...setting, caller: "onKeyDownHandler", currentTime: 0}))
        setPlayPath(newPlayPath);
        setSelectionBegin(newPlayPath)
        scrollPlayPath(playList, newPlayPath)
      } else if (e.key === "ArrowRight") {
        const newPlayPath = getNextPlayPath(playPath)
        console.log('setSetting ArrowRight')
        // setSetting((setting) => ({...setting, caller: "onKeyDownHandler", currentTime: 0}))
        setPlayPath(newPlayPath);
        setSelectionBegin(newPlayPath)
        scrollPlayPath(playList, newPlayPath)
      } else if (e.key === "Enter") {
        console.log('setSetting Enter')
        // setSetting((setting) => ({...setting, caller: "onKeyDownHandler", paused: false}))
        setPaused(false);
        setPlayPath(selectionBegin);
        setSelectionBegin(selectionBegin);
      } else if (e.key === "ArrowUp") {
        if (playList.length == 0) return;
        if (selectionBegin === undefined) {
          setSelectionBegin(playList[0])
          scrollPlayPath(playList, playList[0])
          return;
        }
        let newSelection = getPrevPlayPath(selectionBegin)
        if (newSelection === undefined) {
          newSelection = playList[0]
        }
        setSelectionBegin(newSelection)
        scrollPlayPath(playList, newSelection)
      } else if (e.key === "ArrowDown") {
        if (playList.length == 0) return;
        if (selectionBegin == undefined) {
          setSelectionBegin(playList[0])
          scrollPlayPath(playList, playList[0])
          return;
        }
        let newSelection = getNextPlayPath(selectionBegin)
        if (newSelection === null) {
          newSelection = playList[0]
        }
        setSelectionBegin(newSelection)
        scrollPlayPath(playList, newSelection)
      } else if (e.key === " ") {
        if (playList.length == 0) return;
        if (selectionBegin == undefined) {
          setSelectionBegin(playList[0])
          scrollPlayPath(playList, playList[0])
          return;
        }
        const pos = selectedPlayList.indexOf(selectionBegin);
        if (pos >= 0) {
          removeSelectedPlayList([selectionBegin])
        } else {
          appendSelectedPlayList([selectionBegin])
        }
      }
    }

  }))
}

interface DefaultPlayListState {
  playPath: string | undefined
  paused: boolean
  shuffle: boolean
  playList: string[]
  selectedPlayList: string[]
  selectionBegin: undefined,
}

export const useMoviePlayListStore = createPlayListStore({
  playPath: undefined,
  paused: true,
  shuffle: false,
  playList: [],
  selectedPlayList: [],
  selectionBegin: undefined,
});

export const useMusicPlayListStore = createPlayListStore({
  playPath: undefined,
  paused: true,
  shuffle: true,
  playList: [],
  selectedPlayList: [],
  selectionBegin: undefined,
});

import {create} from 'zustand';
import natsort from "natsort";
import type {Sub} from "@/types/models";
import type {ListImperativeAPI} from "react-window";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'

export interface PlayerSetting {
  caller?: string
  playPath?: string
  currentTime?: number
  volume?: number
  playbackRate?: number
  muted?: boolean
  paused?: boolean
  shuffle?: boolean
  repeat?: RepeatType
  playList?: string[]
  subType?: string
}



interface MediaStore<T extends HTMLMediaElement> {
  mediaRef: T | null
  containerRef: HTMLDivElement | null
  ended: boolean
  setting: PlayerSetting
  filter: string[]
  fullscreen: boolean
  ready: boolean
  subs: Sub[]

  playListRef: ListImperativeAPI | null;
  setPlayListRef: (value: ListImperativeAPI | null) => void;
  scrollPlayPath: (curPlayList: string[], value: string | undefined) => void;


  setMediaRef: (mediaRef: T | null) => void
  setContainerRef: (containerRef: HTMLDivElement | null) => void
  setEnded: (ended: boolean) => void;
  setSetting: (setting: PlayerSetting | ((prev: PlayerSetting) => PlayerSetting)) => void;
  setFilter: (filter: string[]) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setReady: (ready: boolean) => void;
  setSubs: (subs: Sub[]) => void;

  changeVolume: (volume: number | null | undefined) => void;
  changeCurrentTime: (currentTime: number | null | undefined) => void;
  changePlaybackRate: (playbackRate: number | null | undefined) => void;
  changeMuted: (muted: boolean) => void;
  changeSrc: (src: string | null | undefined) => void;
  changeAllTrackMode: (mode: TextTrackMode) => void;

  togglePlay: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;

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
interface MediaDefault {
  shuffle?: boolean
  filter?: string[]
  setting: PlayerSetting
}

export const audioDefault: MediaDefault = {
  filter: ["mp3", "wav", "ogg", "m4a", "opus", "webm"],
  setting: {
    playPath: undefined,
    currentTime: 0,
    volume: 0.5,
    playbackRate: 1.0,
    muted: false,
    paused: true,
    shuffle: true,
    repeat: "repeat_all",
    playList: []
  }

};
export const videoDefault: MediaDefault = {
  filter: ["mp4", "webm", "mkv", "ogg"],
  setting: {
    playPath: undefined,
    currentTime: 0,
    volume: 0.5,
    playbackRate: 1.0,
    muted: false,
    paused: true,
    shuffle: false,
    repeat: "repeat_all",
    playList: []
  }
}

function createMediaStore<T extends HTMLMediaElement>(mediaDefault: MediaDefault) {

  return create<MediaStore<T>>((set, get) => ({
    mediaRef: null,
    containerRef: null,
    ended: false,
    filter: mediaDefault.filter ?? [],
    setting: mediaDefault.setting,
    fullscreen: false,
    ready: false,
    subs: [],

    playListRef: null,

    selectedPlayList: [],
    selectionBegin: undefined,


    setMediaRef: (mediaRef) => {
      // if(mediaRef === null) return;
      set({mediaRef})
    },
    setContainerRef: (containerRef) => {
      set({containerRef})
    },
    setEnded: (ended) => set({ended}),
    setSetting: (updater) => {
      set((state) => ({
        setting:
          typeof updater === "function" ? updater(state.setting) : updater,
      }))
    },
    setFilter: (filter) => set({filter}),
    setFullscreen: (fullscreen) => set({fullscreen}),
    setReady: (ready) => set({ready}),
    setSubs: (subs) => set({subs}),

    changeVolume: (volume) => {
      const audio = get().mediaRef;
      const newVolume = Math.max(0, Math.min(1, volume??0));
      console.log("changeVolume", newVolume);
      if (audio) audio.volume = newVolume;
    },
    changeCurrentTime: (currentTime) => {
      const audio = get().mediaRef;
      console.log("changeCurrentTime", currentTime);
      if (audio) audio.currentTime = currentTime ?? 0;
    },
    changePlaybackRate: (playbackRate) => {
      const audio = get().mediaRef;
      if (audio) audio.playbackRate = playbackRate ?? 1.0;
    },
    changeMuted: (muted) => {
      const audio = get().mediaRef;
      if (audio) audio.muted = muted;
    },
    changeSrc: (src) => {
      if (!src) return;
      const audio = get().mediaRef;
      if (audio) audio.src = src;
    },
    changeAllTrackMode: (mode) => {
      const mediaRef = get().mediaRef;
      if (mediaRef) {
        const tracks = mediaRef.textTracks;
        for(const track of tracks) {
          track.mode = mode;
        }
      }
    },
    togglePlay: async () => {
      const setting = get().setting;
      if (setting == null) return;
      return setting.paused ? get().mediaRef?.pause(): await get().mediaRef?.play();
    },
    toggleRepeat: () => {
      set((state) => {
        const repeat = state.setting.repeat;
        let newRepeat: RepeatType;
        if (repeat === 'repeat_all') {
          newRepeat = 'repeat_one'
        } else if (repeat === 'repeat_one') {
          newRepeat = 'repeat_none'
        } else if (repeat === 'repeat_none') {
          newRepeat = 'repeat_all'
        } else {
          newRepeat = 'repeat_all'
        }
        return {
          setting: {...state.setting, repeat: newRepeat}
        }
      });
    },
    toggleShuffle: () => {
      set((state) => {
        const newShuffle = state.setting.shuffle ?? true;
        return {
          setting: {...state.setting, caller: "toggleShuffle", shuffle: !newShuffle}
        }
      })
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
}




export const useAudioStore = createMediaStore<HTMLAudioElement>(audioDefault);
export const useVideoStore = createMediaStore<HTMLVideoElement>(videoDefault);
// useAudioStore.setState({
//   audioOnly: {
//     setAudioBalance: (l, r) => {
//       const el = useAudioStore.getState().mediaRef?.current;
//       if (el) {
//         // AudioContext 같은 로직 적용 가능
//       }
//     },
//   },
// });



// useAudioStore.setState({
//   audioOnly: {
//     setAudioBalance: (l, r) => {
//       const el = useAudioStore.getState().mediaRef?.current;
//       if (el) {
//         // AudioContext 같은 로직 적용 가능
//       }
//     },
//   },
// });
//
// useVideoStore.setState({
//   // videoOnly: {
//   //   toggleFullScreen: () => {
//   //     const el = useVideoStore.getState().mediaRef?.current;
//   //     el?.requestFullscreen?.();
//   //   },
//   // },
// });



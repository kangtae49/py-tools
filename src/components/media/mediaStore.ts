import {create} from 'zustand';
import natsort from "natsort";
import type {Sub} from "@/types/models";

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
  setMediaRef: (mediaRef: T | null) => void
  ended: boolean
  setting: PlayerSetting | null
  filter: string[]
  fullscreen: boolean
  ready: boolean
  subs: Sub[]

  setEnded: (ended: boolean) => void;
  setSetting: (setting: PlayerSetting | null) => void;
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
  getPrevPlayPath: (value: string | null) => string | null;
  getNextPlayPath: (value: string | null) => string | null;
}
interface MediaDefault {
  shuffle?: boolean
  filter?: string[]
  setting?: PlayerSetting
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

function createMediaStore<T extends HTMLMediaElement>(mediaDefault: MediaDefault = {}) {

  return create<MediaStore<T>>((set, get) => ({
    mediaRef: null,
    ended: false,
    filter: mediaDefault.filter ?? [],
    setting: mediaDefault.setting ?? null,
    fullscreen: false,
    ready: false,
    subs: [],

    setMediaRef: (mediaRef) => {
      // if(mediaRef === null) return;
      set({mediaRef})
    },
    setEnded: (ended) => set({ended}),
    setSetting: (setting) => set({setting}),
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
      const setting = get().setting;
      if (setting === null) return;
      const repeat = get().setting?.repeat;
      const setSetting = get().setSetting;
      if (repeat === 'repeat_all') {
        setSetting({...setting, caller: "toggleRepeat", repeat: 'repeat_one'})
      } else if (repeat === 'repeat_one') {
        setSetting({...setting, caller: "toggleRepeat", repeat: 'repeat_none'})
      } else if (repeat === 'repeat_none') {
        setSetting({...setting, caller: "toggleRepeat", repeat: 'repeat_all'})
      }
    },
    toggleShuffle: () => {
      const setting = get().setting;
      if (setting === null) return;
      const setSetting = get().setSetting;
      setSetting({...setting, caller: "toggleShuffle", shuffle: !setting.shuffle})
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
      if (curPlayList === undefined) return null;
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
      const curPlayList = get().setting?.playList;
      if (curPlayList === undefined) return null;
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



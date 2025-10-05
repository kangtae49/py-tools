import {create} from 'zustand';
import type {RefObject} from "react";
import type {MusicPlayerSetting} from "@/components/media/music_player/musicPlayListStore.ts";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'
const INIT_AUTO_PLAY = true;
const INIT_VOLUME = 0.5;

interface MediaStore<T extends HTMLMediaElement> {
  mediaRef: RefObject<T | null> | null
  setMediaRef: (mediaRef: RefObject<T | null> | null) => void
  volume: number
  duration: number
  currentTime: number
  playbackRate: number
  paused: boolean
  muted: boolean
  autoPlay: boolean
  repeat: RepeatType
  shuffle: boolean
  ended: boolean
  setting: MusicPlayerSetting | null
  filter: string[]
  src: string

  setVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (currentTime: number) => void;
  setPlaybackRate: (playbackRate: number) => void;
  setPaused: (paused: boolean) => void;
  setMuted: (muted: boolean) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setRepeat: (repeat: RepeatType) => void;
  setShuffle: (shuffle: boolean) => void;
  setEnded: (ended: boolean) => void;
  setSetting: (setting: MusicPlayerSetting | null) => void;
  setFilter: (filter: string[]) => void;
  setSrc: (src: string) => void;

  changeVolume: (volume: number) => void;
  changeCurrentTime: (currentTime: number) => void;
  changePlaybackRate: (playbackRate: number) => void;
  changeMuted: (muted: boolean) => void;
  changeSrc: (src: string) => void;

  play: () => Promise<void> | undefined;
  pause: () => void | undefined;
  load: (() => void) | undefined;
  togglePlay: () => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}
interface MediaDefault {
  shuffle?: boolean
  filter?: string[]
}

export const audioDefault: MediaDefault = {
  shuffle: true,
  filter: [],
};
export const videoDefault: MediaDefault = {
  shuffle: false,
  filter: [],
}

function createMediaStore<T extends HTMLMediaElement>(mediaDefault: MediaDefault = {}) {

  return create<MediaStore<T>>((set, get) => ({
    mediaRef: null,
    setMediaRef: (mediaRef) => set({mediaRef}),
    volume: INIT_VOLUME,
    duration: 0,
    currentTime: 0,
    playbackRate: 1.0,
    muted: false,
    paused: !INIT_AUTO_PLAY,
    autoPlay: INIT_AUTO_PLAY,
    repeat: 'repeat_all',
    shuffle: mediaDefault.shuffle ?? true,
    ended: false,
    setting: null,
    filter: mediaDefault.filter ?? [],
    src: '',

    setVolume: (volume) => set({volume}),
    setDuration: (duration) => set({duration}),
    setCurrentTime: (currentTime) => set({currentTime}),
    setPlaybackRate: (playbackRate) => set({playbackRate}),
    setPaused: (paused) => set({paused}),
    setMuted: (muted) => set({muted}),
    setAutoPlay: (autoPlay) => set({autoPlay}),
    setRepeat: (repeat) => set({repeat}),
    setShuffle: (shuffle) => set({shuffle}),
    setEnded: (ended) => set({ended}),
    setSetting: (setting) => set({setting}),
    setFilter: (filter) => set({filter}),
    setSrc: (src) => set({src}),

    changeVolume: (volume) => {
      const audio = get().mediaRef?.current;
      if (audio) audio.volume = Math.max(0, Math.min(1, volume));
    },
    changeCurrentTime: (currentTime) => {
      const audio = get().mediaRef?.current;
      if (audio) audio.currentTime = currentTime;
    },
    changePlaybackRate: (playbackRate) => {
      const audio = get().mediaRef?.current;
      if (audio) audio.playbackRate = playbackRate;
    },
    changeMuted: (muted) => {
      const audio = get().mediaRef?.current;
      if (audio) audio.muted = muted;
    },
    changeSrc: (src) => {
      const audio = get().mediaRef?.current;
      if (audio) audio.src = src;
    },

    play: () => get().mediaRef?.current?.play(),
    pause: () => get().mediaRef?.current?.pause(),
    load: () => get().mediaRef?.current?.load(),
    togglePlay: async () => {
      return get().paused ? await get().play() : get().pause();
    },
    toggleRepeat: () => {
      const repeat = get().repeat;
      if (repeat === 'repeat_all') {
        set({repeat: 'repeat_one'});
      } else if (repeat === 'repeat_one') {
        set({repeat: 'repeat_none'});
      } else if (repeat === 'repeat_none') {
        set({repeat: 'repeat_all'});
      }
    },
    toggleShuffle: () => {
      set({shuffle: !get().shuffle});
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
//
// useVideoStore.setState({
//   // videoOnly: {
//   //   toggleFullScreen: () => {
//   //     const el = useVideoStore.getState().mediaRef?.current;
//   //     el?.requestFullscreen?.();
//   //   },
//   // },
// });



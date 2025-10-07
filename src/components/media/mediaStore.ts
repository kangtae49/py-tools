import {create} from 'zustand';
import type {MusicPlayerSetting} from "@/components/media/music_player/musicPlayListStore.ts";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'
const INIT_AUTO_PLAY = false;
const INIT_VOLUME = 0.5;

interface MediaStore<T extends HTMLMediaElement> {
  mediaRef: T | null
  setMediaRef: (mediaRef: T | null) => void
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

  changeVolume: (volume: number | null | undefined) => void;
  changeCurrentTime: (currentTime: number | null | undefined) => void;
  changePlaybackRate: (playbackRate: number | null | undefined) => void;
  changeMuted: (muted: boolean | null | undefined) => void;
  changeSrc: (src: string | null | undefined) => void;

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
  filter: ["mp3", "wav", "ogg", "m4a", "opus", "webm"]
};
export const videoDefault: MediaDefault = {
  shuffle: false,
  filter: ["*.*"],
}

function createMediaStore<T extends HTMLMediaElement>(mediaDefault: MediaDefault = {}) {

  return create<MediaStore<T>>((set, get) => ({
    mediaRef: null,
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

    setMediaRef: (mediaRef) => {
      if(mediaRef === null) return;
      set({mediaRef})
    },
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
      if (!volume) return;
      const audio = get().mediaRef;
      const setting = get().setting;
      const newVolume = Math.max(0, Math.min(1, volume));
      if (audio) audio.volume = newVolume;
      if (setting != null) {
        set({setting: {...setting, volume: newVolume}})
      }
    },
    changeCurrentTime: (currentTime) => {
      if (!currentTime) return;
      const audio = get().mediaRef;
      const setting = get().setting;
      if (audio) audio.currentTime = currentTime;
      if (setting != null) {
        set({setting: {...setting, currentTime: currentTime}})
      }
    },
    changePlaybackRate: (playbackRate) => {
      if (!playbackRate) return;
      const audio = get().mediaRef;
      const setting = get().setting;
      if (audio) audio.playbackRate = playbackRate;
      if (setting != null) {
        set({setting: {...setting, playbackRate: playbackRate}})
      }
    },
    changeMuted: (muted) => {
      if (!muted) return;
      const audio = get().mediaRef;
      const setting = get().setting;
      if (audio) audio.muted = muted;
      if (setting != null) {
        set({setting: {...setting, muted: muted}})
      }
    },
    changeSrc: (src) => {
      if (!src) return;
      const audio = get().mediaRef;
      const playPath = get().setting?.playPath;
      const setting = get().setting;
      if (audio) audio.src = src;
      if (setting && playPath) {
        set({setting: {...setting, playPath: playPath}})
      }
    },

    play: () => get().mediaRef?.play(),
    pause: () => get().mediaRef?.pause(),
    load: () => get().mediaRef?.load(),
    togglePlay: async () => {
      const setting = get().setting;
      if (setting != null) {
        set({setting: {...setting, paused: !get().paused}})
      }
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



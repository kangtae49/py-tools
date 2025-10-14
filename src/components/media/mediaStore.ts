import {create} from 'zustand';
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
  playList?: string []
  subType?: string
}



export interface MediaStore<T extends HTMLMediaElement> {
  mediaRef: T | null
  containerRef: HTMLDivElement | null
  ended: boolean
  setting: PlayerSetting
  filter: string[]
  fullscreen: boolean
  ready: boolean
  subs: Sub[]

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

    setMediaRef: (mediaRef) => {
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



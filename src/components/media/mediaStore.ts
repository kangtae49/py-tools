import {create} from 'zustand';
import type {Sub} from "@/types/models";
import {srcLocal} from "@/components/utils.ts";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'

export interface MediaSetting {
  caller?: string
  mediaPath?: string
  currentTime: number
  volume: number
  playbackRate: number
  muted: boolean
  paused: boolean
  shuffle: boolean
  repeat: RepeatType
  playList: string []
  subType?: string
}



export interface MediaStore<T extends HTMLMediaElement> {
  mediaRef: T | null
  containerRef: HTMLDivElement | null
  ended: boolean
  currentTime: number
  extensions: string[]
  fullscreen: boolean
  subs: Sub[]
  setting: MediaSetting
  settingName?: string
  defaultSetting: MediaDefault | undefined

  setMediaRef: (mediaRef: T | null) => void
  setContainerRef: (containerRef: HTMLDivElement | null) => void
  setEnded: (ended: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  setSetting: (setting: MediaSetting | ((prev: MediaSetting) => MediaSetting)) => void;
  setExtensions: (filter: string[]) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setSubs: (subs: Sub[]) => void;

  changeVolume: (volume: number | null | undefined) => void;
  changeCurrentTime: (currentTime: number | null | undefined) => void;
  changePlaybackRate: (playbackRate: number | null | undefined) => void;
  changeMuted: (muted: boolean) => void;
  changeSrc: (src: string | null | undefined) => void;
  changeAllTrackMode: (mode: TextTrackMode) => void;

  togglePlay: () => Promise<void>;
  toggleRepeat: () => void;
  loadSrc: (mediaPath: string | undefined) => Promise<void>;

}



function createMediaStore<T extends HTMLMediaElement>(mediaDefault?: MediaDefault) {

  return create<MediaStore<T>>((set, get) => ({
    mediaRef: null,
    containerRef: null,
    ended: false,
    currentTime: 0,
    fullscreen: false,
    subs: [],

    settingName: undefined,
    extensions: [],
    setting: {
      mediaPath: undefined,
      currentTime: 0,
      volume: 0.5,
      playbackRate: 1.0,
      muted: false,
      paused: true,
      shuffle: true,
      repeat: "repeat_all",
      playList: []
    },
    defaultSetting: mediaDefault,
    ...mediaDefault,


    setMediaRef: (mediaRef) => {
      set({mediaRef})
    },
    setContainerRef: (containerRef) => {
      set({containerRef})
    },
    setEnded: (ended) => set({ended}),
    setCurrentTime: (currentTime) => set({currentTime}),
    setSetting: (updater) => {
      set((state) => ({
        setting:
          typeof updater === "function" ? updater(state.setting) : updater,
      }))
    },
    setExtensions: (filter) => set({extensions: filter}),
    setFullscreen: (fullscreen) => set({fullscreen}),
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
    loadSrc: async (mediaPath) => {
      if (mediaPath === undefined) return;
      const {mediaRef, changeAllTrackMode} = get();
      if (mediaRef !== null) {
        changeAllTrackMode('disabled');  // video only
        mediaRef.src = srcLocal(mediaPath);
        mediaRef.load();
      }
    }
    // toggleShuffle: () => {
    //   set((state) => {
    //     const newShuffle = state.setting.shuffle ?? true;
    //     return {
    //       setting: {...state.setting, caller: "toggleShuffle", shuffle: !newShuffle}
    //     }
    //   })
    // },


  }))
}

interface MediaDefault {
  settingName: string,
  setting: MediaSetting
  extensions?: string[]

  shuffle?: boolean
}

export const audioDefault: MediaDefault = {
  settingName: 'music-player.setting.json',
  extensions: ["mp3", "wav", "ogg", "m4a", "opus", "webm"],
  setting: {
    mediaPath: undefined,
    currentTime: 0,
    volume: 0.5,
    playbackRate: 1.0,
    muted: false,
    paused: true,
    shuffle: true,
    repeat: "repeat_all",
    playList: []
  }
}

export const videoDefault: MediaDefault = {
  settingName: 'movie-player.setting.json',
  extensions: ["mp4", "webm", "mkv", "ogg"],
  setting: {
    mediaPath: undefined,
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



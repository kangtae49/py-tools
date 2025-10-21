import {create} from "zustand";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'
export type ViewType = 'grid' | 'single'

export interface PictureSetting {
  caller?: string
  mediaPath?: string
  sliderWidth: number
  sliderHeight: number
  sliderCheck: boolean
  playbackRate: number
  paused: boolean
  shuffle: boolean
  repeat: RepeatType
  playList: string[]
}
interface PictureStore {
  extensions: string[]
  settingName?: string
  setting: PictureSetting
  defaultSetting: PictureDefault | undefined

  viewType: ViewType
  mediaRef: HTMLDivElement | null
  containerRef: HTMLDivElement | null
  fullscreen: boolean

  setMediaRef: (pictureRef: HTMLDivElement | null) => void;
  setContainerRef: (containerRef: HTMLDivElement | null) => void
  setSetting: (setting: PictureSetting | ((prev: PictureSetting) => PictureSetting)) => void;
  setExtensions: (filter: string[]) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setViewType: (viewType: ViewType) => void;

  togglePlay: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}


function createPictureStore(pictureDefault: PictureDefault) {

  return create<PictureStore>((set, _get) => ({
    mediaRef: null,
    containerRef: null,
    fullscreen: false,
    viewType: "grid",

    settingName: undefined,
    defaultSetting: pictureDefault,
    ...pictureDefault,

    setMediaRef: (pictureRef) => set({mediaRef: pictureRef}),
    setContainerRef: (containerRef) => set({containerRef}),

    setSetting: (updater) => {
      set((state) => ({
        setting:
          typeof updater === "function" ? updater(state.setting) : updater,
      }))
    },
    setExtensions: (extensions) => set({extensions}),
    setFullscreen: (fullscreen) => set({fullscreen}),
    setViewType: (viewType) => set({viewType}),

    togglePlay: () => {
      // const setting = get().setting;
      // TODO:
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

interface PictureDefault {
  settingName?: string,
  extensions: string[]
  setting: PictureSetting
}


export const pictureDefault: PictureDefault = {
  settingName: 'picture-player.setting.json',
  extensions: ["jpg", "png", "svg", "bmp"],
  setting: {
    mediaPath: undefined,
    sliderWidth: 64*4,
    sliderHeight: 64*4,
    sliderCheck: true,
    shuffle: false,
    repeat: "repeat_all",
    playList: [],
    playbackRate: 1.0,
    paused: true
  },
};

export const usePictureStore = createPictureStore(pictureDefault);

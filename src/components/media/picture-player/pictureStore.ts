import {create} from "zustand";

export type RepeatType = 'repeat_none' | 'repeat_all' | 'repeat_one'

export interface PictureSetting {
  caller?: string
  playPath?: string
  paused?: boolean
  shuffle?: boolean
  repeat?: RepeatType
  playList?: string[]
}
interface PictureStore {
  pictureRef: HTMLDivElement | null
  containerRef: HTMLDivElement | null
  filter: string[]
  fullscreen: boolean
  setting: PictureSetting

  setPictureRef: (pictureRef: HTMLDivElement | null) => void;
  setContainerRef: (containerRef: HTMLDivElement | null) => void
  setSetting: (setting: PictureSetting | ((prev: PictureSetting) => PictureSetting)) => void;
  setFilter: (filter: string[]) => void;
  setFullscreen: (fullscreen: boolean) => void;

  togglePlay: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}


function createPictureStore(pictureDefault?: PictureDefault) {

  return create<PictureStore>((set, _get) => ({
    pictureRef: null,
    containerRef: null,
    filter: ["jpg", "png", "svg", "bmp"],
    fullscreen: false,
    setting: {
      paused: true,
      shuffle: true,
      repeat: "repeat_all",
      playList: []
    },
    selectedPlayList: [],
    selectionBegin: undefined,
    ...pictureDefault,

    setPictureRef: (pictureRef) => set({pictureRef}),
    setContainerRef: (containerRef) => set({containerRef}),

    setSetting: (updater) => {
      set((state) => ({
        setting:
          typeof updater === "function" ? updater(state.setting) : updater,
      }))
    },
    setFilter: (filter) => set({filter}),
    setFullscreen: (fullscreen) => set({fullscreen}),

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
  shuffle?: boolean
  filter?: string[]
  setting: PictureSetting
}


export const pictureDefault: PictureDefault = {
  filter: ["jpg", "png", "svg", "bmp"],
  setting: {
    playPath: undefined,
    shuffle: true,
    repeat: "repeat_all",
    playList: []
  }

};

export const usePictureStore = createPictureStore(pictureDefault);

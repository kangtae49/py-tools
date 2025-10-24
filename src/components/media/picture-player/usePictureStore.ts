import {create} from "zustand";
import type {GridImperativeAPI} from "react-window";
import {SCROLL_SIZE, SLIDER_MIN, SLIDER_SIZE} from "@/components/media/picture-grid/PictureGridView.tsx";

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
interface UsePictureStore {
  extensions: string[]
  settingName?: string
  setting: PictureSetting
  defaultSetting: PictureDefault | undefined

  viewType: ViewType
  mediaRef: HTMLDivElement | null
  containerRef: HTMLDivElement | null
  gridRef: GridImperativeAPI | null
  sliderWidthRef: HTMLInputElement | null
  sliderHeightRef: HTMLInputElement | null
  fullscreen: boolean
  columnCount: number
  rowCount: number
  gridWidth: number
  gridHeight: number

  setMediaRef: (pictureRef: HTMLDivElement | null) => void;
  setContainerRef: (containerRef: HTMLDivElement | null) => void
  setGridRef: (gridRef: GridImperativeAPI | null) => void;
  setSliderWidthRef: (sliderWidthRef: HTMLInputElement | null) => void;
  setSliderHeightRef: (sliderHeightRef: HTMLInputElement | null) => void;

  setSetting: (setting: PictureSetting | ((prev: PictureSetting) => PictureSetting)) => void;
  setExtensions: (filter: string[]) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setViewType: (viewType: ViewType) => void;
  setColumnCount: (columnCount: number) => void;
  setRowCount: (rowCount: number) => void;
  setGridWidth: (gridWidth: number) => void;
  setGridHeight: (gridHeight: number) => void;


  scrollGrid: (curPlayList: string[], value: string | undefined) => void;

  togglePlay: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  resizeSlider: () => void;
}


function createPictureStore(pictureDefault: PictureDefault) {

  return create<UsePictureStore>((set, get) => ({
    mediaRef: null,
    containerRef: null,
    gridRef: null,
    fullscreen: false,
    viewType: "grid",
    columnCount: 1,
    rowCount: 1,
    gridWidth: 32,
    gridHeight: 32,
    sliderWidthRef: null,
    sliderHeightRef: null,

    settingName: undefined,
    defaultSetting: pictureDefault,
    ...pictureDefault,

    setMediaRef: (pictureRef) => set({mediaRef: pictureRef}),
    setContainerRef: (containerRef) => set({containerRef}),
    setGridRef: (gridRef) => set({gridRef}),
    setSliderWidthRef: (sliderWidthRef) => set({sliderWidthRef}),
    setSliderHeightRef: (sliderHeightRef) => set({sliderHeightRef}),

    setSetting: (updater) => {
      set((state) => ({
        setting:
          typeof updater === "function" ? updater(state.setting) : updater,
      }))
    },
    setExtensions: (extensions) => set({extensions}),
    setFullscreen: (fullscreen) => set({fullscreen}),
    setViewType: (viewType) => set({viewType}),
    setColumnCount: (columnCount) => set({columnCount}),
    setRowCount: (rowCount) => set({rowCount}),
    setGridWidth: (gridWidth) => set({gridWidth}),
    setGridHeight: (gridHeight) => set({gridHeight}),


    scrollGrid: (curPlayList, value) => {
      if(value === undefined) return;
      const {gridRef, columnCount} = get();
      const idx = curPlayList.indexOf(value);
      const columnIndex = idx % columnCount;
      const rowIndex = Math.floor(idx / columnCount);
      console.log("scrollGrid", rowIndex, columnIndex);

      try {
        gridRef?.scrollToCell({rowAlign: "start", columnAlign: "start", behavior: "auto",
          columnIndex: columnIndex, rowIndex: rowIndex});
      } catch(e) {
      }
    },

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
    resizeSlider: () => {
      const {
        setSetting,
        sliderWidthRef, sliderHeightRef,
        gridWidth, gridHeight,
      } = get()
      let valWidth = Number(sliderWidthRef?.value) ?? SLIDER_MIN;
      const SLIDER_WIDTH_MAX = gridWidth - SLIDER_SIZE - SCROLL_SIZE;
      valWidth = Math.max(valWidth, SLIDER_MIN)
      valWidth = Math.min(valWidth, SLIDER_WIDTH_MAX)

      let valHeight = Number(sliderHeightRef?.value) ?? SLIDER_MIN;
      const SLIDER_HEIGHT_MAX = gridHeight - SLIDER_SIZE - SCROLL_SIZE;
      valHeight = Math.max(valHeight, SLIDER_MIN)
      valHeight = Math.min(valHeight, SLIDER_HEIGHT_MAX)

      setSetting((setting) => ({...setting, sliderWidth: valWidth, sliderHeight: valHeight}))
      // if (setting.sliderCheck) {
      //   setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
      // } else {
      //   setSetting((setting) => ({...setting, sliderWidth: val}))
      // }
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

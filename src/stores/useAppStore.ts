import {create} from "zustand";

export interface AppState {
  activeWidgetRef: HTMLElement | null
  fullscreenRef: HTMLElement | null

  setActiveWidgetRef: (activeWidgetRef: HTMLElement | null) => void
  setFullscreenRef: (fullscreenRef: HTMLElement | null) => void
}

export const useAppStore = create<AppState>((set, _get) => ({
  activeWidgetRef: null,
  fullscreenRef: null,

  setActiveWidgetRef: (activeWidgetRef) => {set(() => ({activeWidgetRef}))},
  setFullscreenRef: (fullscreenRef) => {set(() => ({fullscreenRef}))},
}))



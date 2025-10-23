import {create} from "zustand";
import {commands} from "@/bindings.ts";

export interface AppState {
  activeWidgetRef: HTMLElement | null
  fullscreenRef: HTMLElement | null

  setActiveWidgetRef: (activeWidgetRef: HTMLElement | null) => void
  setFullscreenRef: (fullscreenRef: HTMLElement | null) => void

  toggleFullscreen: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  activeWidgetRef: null,
  fullscreenRef: null,

  setActiveWidgetRef: (activeWidgetRef) => {set(() => ({activeWidgetRef}))},
  setFullscreenRef: (fullscreenRef) => {set(() => ({fullscreenRef}))},

  toggleFullscreen: async () => {
    const {activeWidgetRef} = get();
    // if(fullscreenRef === null) return;
    commands.isFullscreen().then((res) => {
      if(res.status === "ok") {
        const isFullscreen = res.data;
        // commands.change_fullscreen(!isFullscreen);
        if(isFullscreen) {
          if (document.hasFocus() && document.fullscreenElement) {
            document.exitFullscreen();
          }
        } else {
          activeWidgetRef?.querySelector(".fullscreen")?.requestFullscreen();
        }
      }
    })
  },
}))



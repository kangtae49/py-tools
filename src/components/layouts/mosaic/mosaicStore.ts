import {create} from "zustand/react";
import type {MosaicNode} from "react-mosaic-component";


export type AboutKey = 'about'
export type HelpKey = 'help'
export type MusicPlayerKey = 'music-player'
export type MoviePlayerKey = 'movie-player'
export type PicturePlayerKey = 'picture-player'
export type MonacoKey = 'monaco'
export type MdKey = 'md'
export type MonacoPathKey = `${MonacoKey}-${string}`
export type MdPathKey = `${MdKey}-${string}`

export const defaultLayout: MosaicNode<WinKey> = {
  direction: "column",
    first: "about",
  second: "help"
}

export interface MosaicDefault {
  settingName: string
  layout: MosaicNode<WinKey> | null
}

export type WinKey =
  | AboutKey
  | HelpKey
  | MusicPlayerKey
  | MoviePlayerKey
  | PicturePlayerKey
  | MonacoPathKey
  | MdPathKey

export type WinType =
  | AboutKey
  | HelpKey
  | MusicPlayerKey
  | MoviePlayerKey
  | PicturePlayerKey
  | MonacoKey
  | MdKey

export interface MosaicSetting {
  layout: MosaicNode<WinKey> | null
}

export function getWinPath(key: WinKey): string | null {

  if (key.startsWith("monaco-")) {
    return key.slice("monaco-".length);
  }
  if (key.startsWith("md-")) {
    return key.slice("md-".length);
  }
  return null;
}

export function getWinType(key: WinKey): WinType {
  if (key.startsWith("monaco-")) {
    return "monaco";
  }
  if (key.startsWith("md-")) {
    return "md";
  } else {
    return key as WinType
  }
}

interface MosaicStore {
  setting: MosaicSetting
  defaultSetting: MosaicDefault | undefined

  viewRefs: Partial<Record<WinKey, HTMLDivElement | null>>
  mosaicValue: MosaicNode<WinKey> | null;
  maxScreenView: WinKey | null;

  setMosaicValue: (value: MosaicNode<WinKey> | null) => void;
  setMaxScreenView: (value: WinKey | null) => void;
  setSetting: (setting: MosaicSetting | ((prev: MosaicSetting) => MosaicSetting)) => void;

  updateViewRef: (id: WinKey, el: HTMLDivElement | null) => void;
  addView: (id: WinKey) => void;
  removeView: (id: WinKey) => void;
  maximizeView: (id: WinKey) => void;
  minimizeView: (id: WinKey) => void;
}

/*
const viewRefs = useRef<Partial<Record<WinKey, HTMLDivElement | null>>>({});
const setViewRef = (id: WinKey, el: HTMLDivElement | null) => {
  viewRefs.current[id] = el;
};

 */

export const useMosaicStore = create<MosaicStore>((set, get) => ({
  mosaicValue: null,
  viewRefs: {},
  maxScreenView: null,
  setting: {
    settingName: "mosaic-layout.setting.json",
    layout: null
  },
  defaultSetting: {
    settingName: "mosaic-layout.setting.json",
    layout: null
  },

  setMosaicValue: (value) => set({ mosaicValue: value }),
  setMaxScreenView: (value) => set({ maxScreenView: value }),
  setSetting: (updater) => {
    set((state) => ({
      setting:
        typeof updater === "function" ? updater(state.setting) : updater,
    }))
  },

  updateViewRef: (id, el) => {
    if (el === null) return;
    if (get().viewRefs[id]) return;
    console.log("updateViewRef", id, el);
    set((state) => ({viewRefs: { ...state.viewRefs, [id]: el }}))
  },
  addView: (id: WinKey) => {
    console.log("addView", id);
    const current = get().mosaicValue;
    if (!current) {
      set({ mosaicValue: id });
      return;
    }

    const collectIds = (node: MosaicNode<WinKey> | null): WinKey[] => {
      if (!node) return [];
      if (typeof node === 'string') return [node];
      return [...collectIds(node.first), ...collectIds(node.second)];
    };
    const existingIds = collectIds(current);

    if (!existingIds.includes(id)) {
      // get().mosaicValue;

      set({
        mosaicValue: {
          direction: 'row',
          first: id,
          second: current
        }
      });
      return;
    }

    const updateSplit = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;
      console.log("updateSplit", node);

      if (typeof node === "string") {
        return node;
      }

      const first = updateSplit(node.first);
      const second = updateSplit(node.second);
      if (first === null || second === null) return node;

      if ((node.splitPercentage === 0 && first === id) || (node.splitPercentage === 100 && second === id)) {
        return { ...node, splitPercentage: 50, first, second };
      }

      return {...node, first, second}
    };
    set({ mosaicValue: updateSplit(current) });
    if ((document as any).webkitFullscreenElement) {
      get().viewRefs[id]?.closest(".mosaic-window")?.requestFullscreen();
    }

  },
  removeView: (id: WinKey) => {
    const removeNode = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;
      if (typeof node === 'string') {
        return node === id ? null : node;
      }
      const first = removeNode(node.first);
      const second = removeNode(node.second);

      if (!first && !second) return null;
      if (!first) return second;
      if (!second) return first;

      return { ...node, first, second };
    };

    const newValue = removeNode(get().mosaicValue);
    set({ mosaicValue: newValue });
  },
  maximizeView: (id: WinKey) => {
    const updateSplit = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;

      if (typeof node === "string") {
        return node;
      }

      const first = updateSplit(node.first);
      const second = updateSplit(node.second);

      if (!first && !second) return null;
      if (!first) return second;
      if (!second) return first;

      if (first === id) {
        return { ...node, splitPercentage: 95, first, second };
      } else if(second === id) {
        return { ...node, splitPercentage: 5, first, second };
      }

      return { ...node, first, second };
    };

    set({ mosaicValue: updateSplit(get().mosaicValue) });
  },

  minimizeView: (id: WinKey) => {
    const updateSplit = (node: MosaicNode<WinKey> | null): MosaicNode<WinKey> | null => {
      if (!node) return null;

      if (typeof node === "string") {
        return node;
      }

      const first = updateSplit(node.first);
      const second = updateSplit(node.second);

      if (!first && !second) return null;
      if (!first) return second;
      if (!second) return first;

      if (first === id) {
        return { ...node, splitPercentage: 5, first, second };
      } else if(second === id) {
        return { ...node, splitPercentage: 95, first, second };
      }

      return { ...node, first, second };
    };

    set({ mosaicValue: updateSplit(get().mosaicValue) });
  },

}));



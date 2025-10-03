import {create} from "zustand";
import type {GoldenLayout} from "golden-layout";
import * as React from "react";

export interface GoldenState {
  layoutRef: React.RefObject<GoldenLayout | null> | null
  containerRef: React.RefObject<HTMLDivElement | null> | null

  setLayoutRef: (ref: React.RefObject<GoldenLayout | null>) => void
  setContainerRef: (ref: React.RefObject<HTMLDivElement | null>) => void
}

export const useGoldenStore = create<GoldenState>((set) => ({
  layoutRef: null,
  containerRef: null,
  setLayoutRef: (layoutRef) => set(()=> ({layoutRef})),
  setContainerRef: (containerRef) => set(()=> ({containerRef})),
}))

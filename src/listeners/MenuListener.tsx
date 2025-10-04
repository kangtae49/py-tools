import {useEffect} from "react";
import {useMosaicStore, type WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

export function MenuListener() {
  const {addView} = useMosaicStore();
  useEffect(() => {
    const onMenuHandler = (e: CustomEvent) => {
      const menu = e.detail as WinKey;
      addView(menu)
    };
    window?.addEventListener("click-menu", onMenuHandler as EventListener);
    return () => window?.removeEventListener("click-menu", onMenuHandler as EventListener);
  }, [])


  return null;
}

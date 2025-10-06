import {useEffect} from "react";
import {useMosaicStore, type WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

export function MenuListener() {
  const {addView, maxScreenView, setMaxScreenView} = useMosaicStore();
  useEffect(() => {
    const onMenuHandler = (e: CustomEvent) => {
      const menu = e.detail as WinKey;
      addView(menu)
      if ((document as any).webkitFullscreenElement && maxScreenView !== menu) {
        document.exitFullscreen().then()
        setMaxScreenView(null)
      }
    };
    window?.addEventListener("click-menu", onMenuHandler as EventListener);
    return () => window?.removeEventListener("click-menu", onMenuHandler as EventListener);
  }, [maxScreenView])


  return null;
}

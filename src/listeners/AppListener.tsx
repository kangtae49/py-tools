import {useEffect} from "react";
import {useAppStore} from "@/stores/useAppStore.ts";
import {useMosaicStore} from "@/components/layouts/mosaic/mosaicStore.ts";

export default function AppListener() {
  const {setActiveWidgetRef} = useAppStore();
  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as Element
    const widget = target.closest('.mosaic-window') as HTMLElement | null;
    if (widget) {
      document.querySelectorAll('.mosaic-window .title-bar').forEach((titleBar) => {
        titleBar.classList.remove('active');
      });
      widget.querySelector('.title-bar')?.classList.add('active');
      console.log('focusin', widget, target);
      setActiveWidgetRef(widget);
    }
  }

  // const onFocusOut = (e: FocusEvent) => {
  //   const target = e.target as Element
  //   const widget = target.closest('.widget')
  //   if (widget) {
  //     setActiveWidgetRef(null);
  //   }
  // }

  const handleKeyDown = (e: KeyboardEvent) => {
    const {toggleFullscreen} = useAppStore.getState()
    if (e.key === "F11") {
      e.preventDefault();
      const {maxScreenView} = useMosaicStore.getState();
      if (maxScreenView !== null) {
        if (document.hasFocus() && document.fullscreenElement) {
          document.exitFullscreen().then(() => {
            toggleFullscreen()
          });
        }

      } else {
        toggleFullscreen()
      }
    }
  };

  useEffect(() => {
    window.addEventListener("focusin", onFocusIn)
    // window.addEventListener("focusout", onFocusOut)
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("focusin", onFocusIn)
      // window.removeEventListener("focusout", onFocusOut)
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [])
  return null
}
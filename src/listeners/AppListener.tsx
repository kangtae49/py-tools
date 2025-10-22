import {useEffect} from "react";
import {useAppStore} from "@/stores/useAppStore.ts";

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

  useEffect(() => {
    window.addEventListener("focusin", onFocusIn)
    // window.addEventListener("focusout", onFocusOut)
    return () => {
      window.removeEventListener("focusin", onFocusIn)
      // window.removeEventListener("focusout", onFocusOut)
    }
  }, [])
  return null
}
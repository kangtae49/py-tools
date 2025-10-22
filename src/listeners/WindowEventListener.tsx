import {useEffect} from "react";
import {commands} from "@/bindings.ts";
// import {MUSIC_PLAYER_SETTING} from "@/components/media/music_player/MusicPlayerView.tsx";

export default function WindowEventListener() {
  useEffect(() => {
    const onWindowEventHandler = (e: CustomEvent) => {
      const event = e.detail;
      console.log("window-event:", event);
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      console.log('React app closing...');
      commands.unload().then(() => {
        console.log('appWriteFiles');
      })
    }

    // const onFocusIn = (e: FocusEvent) => {
      // const target = e.target as HTMLElement;
      // const widget = target.closest('.widget');

      // target.closest('.widget')?.classList.add('focus');
      // const widget = document.activeElement?.closest('.widget');
    // }

    window.addEventListener("window-event", onWindowEventHandler as EventListener);
    window.addEventListener('beforeunload', onBeforeUnload);
    // window.addEventListener("focusin", onFocusIn);

    return () => {


      window?.removeEventListener("click-menu", onWindowEventHandler as EventListener);
      window?.removeEventListener("beforeunload", onBeforeUnload);
    }
  }, [])


  return null;
}

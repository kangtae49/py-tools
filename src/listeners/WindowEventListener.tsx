import {useEffect} from "react";
import {commands} from "@/bindings.ts";
// import {MUSIC_PLAYER_SETTING} from "@/components/media/music_player/MusicPlayerView.tsx";

export function WindowEventListener() {
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

    window?.addEventListener("window-event", onWindowEventHandler as EventListener);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {


      window?.removeEventListener("click-menu", onWindowEventHandler as EventListener);
      window?.removeEventListener("beforeunload", onBeforeUnload);
    }
  }, [])


  return null;
}

import {useEffect} from "react";
// import {commands} from "@/bindings.ts";
// import {MUSIC_PLAYER_LATEST_PLAYLIST, MUSIC_PLAYER_SETTING} from "@/components/media/music_player/MusicPlayerView.tsx";
// import {useMusicPlayListStore} from "@/components/media/music_player/musicPlayListStore.ts";
// import {useAudioStore} from "@/components/media/mediaStore.ts";

export function WindowEventListener() {
  // const {playList} = useMusicPlayListStore();
  // const {setting} = useAudioStore();
  useEffect(() => {
    const onWindowEventHandler = (e: CustomEvent) => {
      const event = e.detail;
      console.log("window-event:", event);
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      console.log('React app closing...');
      // commands.appWriteFile(MUSIC_PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
      //   console.log(result.status, 'appWriteFile', MUSIC_PLAYER_SETTING);
      // })
      // const content = JSON.stringify(playList, null, 2);
      // commands.appWriteFile(MUSIC_PLAYER_LATEST_PLAYLIST, content).then((result) => {
      //   console.log(result.status, 'appWriteFile', MUSIC_PLAYER_LATEST_PLAYLIST);
      // })

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

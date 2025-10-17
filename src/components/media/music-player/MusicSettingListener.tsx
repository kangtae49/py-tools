import {
  type MediaSetting,
  useAudioStore as useMediaStore,
  audioDefault as mediaDefault
} from "@/components/media/mediaStore.ts";
import {commands} from "@/bindings.ts";
import {PLAYER_SETTING} from "./MusicPlayerView.tsx";
import {useEffect, useState} from "react";
import {useMusicPlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";

function MusicSettingListener() {
  const [initialized, setInitialized] = useState(false);

  const {
    setting,
  } = useMediaStore();

  useEffect(() => {
    const {ready} = useMediaStore.getState();
    const setting = useMediaStore.getState().setting;
    if(setting === null) return;
    if(!ready) return;
    commands.appWrite(PLAYER_SETTING, JSON.stringify(setting, null, 2)).then()
  }, [setting])

  const onMount = async () => {
    console.log('onMount')
    mountSetting();
  }

  const onUnMount = async () => {
    console.log('onUnMount')
    unMountSetting()
  }

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      onMount().then();
    }

    return () => {
      onUnMount().then()
    }
  }, [])

  return null
}


export const mountSetting = () => {
  commands.appReadFile(PLAYER_SETTING).then(result => {
    const {
      setSetting,
      setCurrentTime,
    } = useMediaStore.getState()
    const {
      setPlayPath,
      setPlayList,
      setShuffle,
      setPlaying,
      setSelectionBegin,
    } = usePlayListStore.getState();

    let newSetting: MediaSetting | null;
    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      if (result.data === "null") {
        newSetting = mediaDefault.setting ?? null;
      }
      commands.appWrite(PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then()
    } else {
      newSetting = mediaDefault.setting ?? null;
      commands.appWrite(PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then(() => {
        commands.appWriteFile(PLAYER_SETTING, "null").then()
      })
    }

    const newPlayList = newSetting?.playList ?? []
    const newPlayPath = newSetting?.mediaPath ?? newPlayList[0];
    const newCurrenTime = newSetting?.currentTime ?? 0;
    const newShuffle = newSetting?.shuffle ?? false;
    const newPaused = newSetting?.paused ?? false;

    setSetting((_setting) => ({
      ...newSetting, caller: "onMount",
      mediaPath: newPlayPath,
      playList: newPlayList,
      shuffle: newShuffle,
      paused: newPaused,
      currentTime: newCurrenTime,
    }))

    setPlayPath(newPlayPath)
    setPlayList(newPlayList)
    setShuffle(newShuffle)
    setPlaying(!newPaused)
    setCurrentTime(newCurrenTime)
    setSelectionBegin(newPlayPath)
  })

}

export function unMountSetting() {
  const ready = useMediaStore.getState().ready;
  if (ready) {
    commands.appRead(PLAYER_SETTING).then((result) => {
      if (result.status === 'ok') {
        commands.appWriteFile(PLAYER_SETTING, "{}").then()
      }
    })
  }
}

export default MusicSettingListener;
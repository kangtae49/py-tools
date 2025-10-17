import {
  type PlayerSetting,
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
    console.log('setting', setting);
    commands.appWrite(PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', PLAYER_SETTING);
    })
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
      setPaused,
      setSelectionBegin,
    } = usePlayListStore.getState();

    let newSetting: PlayerSetting | null;
    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      if (result.data === "null") {
        newSetting = mediaDefault.setting ?? null;
      }
      commands.appWrite(PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', PLAYER_SETTING);
      })
    } else {
      newSetting = mediaDefault.setting ?? null;
      commands.appWrite(PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', PLAYER_SETTING);
      })
      commands.appWriteFile(PLAYER_SETTING, "null").then((result) => {
        console.log(result.status, 'appWriteFile', PLAYER_SETTING);
      })
    }

    const newPlayList = newSetting?.playList ?? []
    const newPlayPath = newSetting?.playPath ?? newPlayList[0];
    const newCurrenTime = newSetting?.currentTime ?? 0;
    const newShuffle = newSetting?.shuffle ?? false;
    const newPaused = newSetting?.paused ?? false;

    setSetting((_setting) => ({
      ...newSetting, caller: "onMount",
      playPath: newPlayPath,
      playList: newPlayList,
      shuffle: newShuffle,
      paused: newPaused,
      currentTime: newCurrenTime,
    }))

    setPlayPath(newPlayPath)
    setPlayList(newPlayList)
    setShuffle(newShuffle)
    setPaused(newPaused)
    console.log('mount currentTime', newCurrenTime);
    setCurrentTime(newCurrenTime)
    setSelectionBegin(newPlayPath)
  })

}

export function unMountSetting() {
  const ready = useMediaStore.getState().ready;
  if (ready) {
    commands.appRead(PLAYER_SETTING).then((result) => {
      if (result.status === 'ok') {
        commands.appWriteFile(PLAYER_SETTING, "{}").then((result) => {
          console.log(result.status, 'appWriteFile', PLAYER_SETTING);
        })
      }
    })
  }
}

export default MusicSettingListener;
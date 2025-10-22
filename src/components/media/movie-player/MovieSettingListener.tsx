import {useEffect, useState} from "react";
import {commands} from "@/bindings.ts";
import {
  type MediaSetting,
  useVideoStore as useMediaStore,
} from "@/components/media/useMediaStore.ts";
import {useMoviePlayListStore as usePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";

function MovieSettingListener() {
  const [ready, setReady] = useState(false);
  const {
    setting,
    defaultSetting
  } = useMediaStore();

  useEffect(() => {
    onMount().then(() => {
      setReady(true);
    });

    return () => {
      if (ready) {
        onUnMount().then()
      }
    }
  }, [])

  useEffect(() => {
    if(!ready) return;
    if(defaultSetting?.settingName === undefined) return;
    commands.appWrite(defaultSetting.settingName, JSON.stringify(setting, null, 2)).then()
  }, [setting])

  const onMount = async () => {
    console.log('onMount')
    await mountSetting();
  }

  const onUnMount = async () => {
    console.log('onUnMount')
    await unMountSetting()
  }

  return null
}


export const mountSetting = async () => {
  console.log('MovieSetting mountSetting');
  const {
    setSetting,
    setCurrentTime,
    defaultSetting
  } = useMediaStore.getState()
  const {
    setPlayPath,
    setPlayList,
    setShuffle,
    setPlaying,
    setSelectionBegin,
  } = usePlayListStore.getState();
  if(defaultSetting?.settingName === undefined) return;
  let newSetting: MediaSetting | null = null;

  const res = await commands.appRead(defaultSetting.settingName);
  if (res.status === 'ok') {
    newSetting = JSON.parse(res.data);
  }

  if (newSetting === null) {
    const result = await commands.appReadFile(defaultSetting.settingName);
    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      await commands.appWrite(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
    }
  }

  if (newSetting === null) return;

  const newPlayList = newSetting.playList
  const newPlayPath = newSetting.mediaPath ?? newPlayList[0];
  const newCurrenTime = newSetting.currentTime;
  const newShuffle = newSetting.shuffle;
  const newPaused = newSetting.paused;

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

}

export const unMountSetting = async () => {
  const {setting, defaultSetting} = useMediaStore.getState();
  if(defaultSetting?.settingName === undefined) return;

  await commands.appWrite(defaultSetting.settingName, JSON.stringify(setting, null, 2))
  await commands.appWriteFile(defaultSetting.settingName, JSON.stringify(setting, null, 2))
}

export default MovieSettingListener;
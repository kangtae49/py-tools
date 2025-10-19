import {useEffect} from "react";
import {commands} from "@/bindings.ts";
import {
  type MediaSetting,
  useVideoStore as useMediaStore,
} from "@/components/media/mediaStore.ts";
import {useMoviePlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";

function MovieSettingListener() {
  const {
    setting,
    defaultSetting
  } = useMediaStore();

  useEffect(() => {
    onMount().then();

    return () => {
      onUnMount().then()
    }
  }, [])

  useEffect(() => {
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

  const result = await commands.appReadFile(defaultSetting.settingName);
  if(result.status === 'ok') {
    newSetting = JSON.parse(result.data);
    if (result.data === "null") {
      newSetting = defaultSetting;
    }
    await commands.appWrite(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
  } else {
    newSetting = defaultSetting;
    await commands.appWrite(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
    await commands.appWriteFile(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
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

}

export const unMountSetting = async () => {
  const {setting, defaultSetting} = useMediaStore.getState();
  if(defaultSetting?.settingName === undefined) return;

  await commands.appWrite(defaultSetting.settingName, JSON.stringify(setting, null, 2))
  await commands.appWriteFile(defaultSetting.settingName, JSON.stringify(setting, null, 2))
}

export default MovieSettingListener;
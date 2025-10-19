import {useEffect} from "react";
import {commands} from "@/bindings.ts";
import {useMosaicStore} from "./mosaicStore.ts";

function MosaicSettingListener() {
  const {
    setting,
    defaultSetting,
  } = useMosaicStore();

  useEffect(() => {
    onMount().then();

    return () => {
      onUnMount().then()
    }
  }, [])

  useEffect(() => {
    if (defaultSetting?.settingName === undefined) return;
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
    setMosaicValue,
    setSetting,
    defaultSetting
  } = useMosaicStore.getState()
  if (defaultSetting?.settingName === undefined) return;
  const result = await commands.appReadFile(defaultSetting.settingName);
  let newSetting;
  if (result.status === 'ok') {
    newSetting = JSON.parse(result.data);
    if (result.data === "{}") {
      newSetting = defaultSetting;
    }
    await commands.appWrite(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
  } else {
    newSetting = defaultSetting;
    await commands.appWrite(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
    await commands.appWriteFile(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
  }
  setMosaicValue(newSetting.layout);
  setSetting((_setting) => newSetting)

}

export const unMountSetting = async () => {
  const {setting, defaultSetting} = useMosaicStore.getState()
  if (defaultSetting?.settingName === undefined) return;

  await commands.appWrite(defaultSetting.settingName, JSON.stringify(setting, null, 2))
  await commands.appWriteFile(defaultSetting.settingName, JSON.stringify(setting, null, 2))
}

export default MosaicSettingListener;
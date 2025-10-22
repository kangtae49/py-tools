import {commands} from "@/bindings.ts";
import {type MosaicSetting, useMosaicStore} from "./mosaicStore.ts";
import useOnload from "@/stores/useOnload.ts";

function MosaicSettingListener() {
  const {onLoad, onUnload, useReadyEffect} = useOnload()
  // const [ready, setReady] = useState(false);
  const {
    setting,
    defaultSetting,
  } = useMosaicStore();

  onLoad(() => {
    mountSetting();
  })

  onUnload(() => {
    unMountSetting()
  })

  useReadyEffect(() => {
    // if(!ready) return;
    if (defaultSetting?.settingName === undefined) return;
    console.log('MosaicSetting', setting);
    commands.appWrite(defaultSetting.settingName, JSON.stringify(setting, null, 2)).then()
  }, [setting])

  return null
}


export const mountSetting = async () => {
  console.log('MosaicSetting mountSetting');
  const {
    setMosaicValue,
    setSetting,
    defaultSetting
  } = useMosaicStore.getState()
  if (defaultSetting?.settingName === undefined) return;
  let newSetting: MosaicSetting | null = null;

  const res = await commands.appRead(defaultSetting.settingName);
  if (res.status === 'ok') {
    newSetting = JSON.parse(res.data);
    console.log("mosaic read python", newSetting);
  }

  if (newSetting === null) {
    const result = await commands.appReadFile(defaultSetting.settingName);
    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      console.log("mosaic read file", newSetting);
      await commands.appWrite(defaultSetting.settingName, JSON.stringify(newSetting, null, 2))
    }
  }

  if (newSetting === null) return;

  setSetting((_setting) => newSetting)
  console.log('MosaicSetting Layout', newSetting.layout);
  setMosaicValue(newSetting.layout);

}

export const unMountSetting = async () => {
  const {setting, defaultSetting} = useMosaicStore.getState()
  if (defaultSetting?.settingName === undefined) return;
  console.log('MosaicSetting unMountSetting', setting);
  await commands.appWrite(defaultSetting.settingName, JSON.stringify(setting, null, 2))
  await commands.appWriteFile(defaultSetting.settingName, JSON.stringify(setting, null, 2))
}

export default MosaicSettingListener;
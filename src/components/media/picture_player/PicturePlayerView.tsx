import "./PicturePlayerView.css"
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import {Grid} from "react-window";
import ImageListView from "./ImageListView.tsx";
import PlayListView from "@/components/media/playlist/PlayListView.tsx";
import {usePicturePlayListStore as usePlayListStore} from "@/components/media/playlist/playListStore.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faArrowsSpin,
  faBackwardStep,
  faBookMedical, faCirclePause, faCirclePlay, faExpand,
  faFloppyDisk,
  faFolderPlus, faForwardStep,
  faImage, faMinus, faRotateRight,
  faShuffle,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import React, {useEffect, useState} from "react";
import {commands} from "@/bindings.ts";
import {
  type PictureSetting,
  usePictureStore,
  pictureDefault
} from "./pictureStore.ts";
import {useVideoStore as useMediaStore} from "@/components/media/mediaStore.ts";
import toast from "react-hot-toast";
import type {DropFile} from "@/types/models";

export const PLAYER_SETTING = 'picture-player.setting.json'

interface Prop {
  winKey: WinKey
}

export default function PicturePlayerView({winKey: _}: Prop) {
  const [initialized, setInitialized] = useState(false);

  const {
    pictureRef, setPictureRef,
    // setting,
    containerRef, setContainerRef,
    toggleRepeat,
    toggleShuffle,
    // setPlayListRef,
    setting, setSetting,
    filter,
    setReady,
  } = usePictureStore();

  const {
    setPaused,
    playList, setPlayList,
    appendPlayList, shufflePlayList, natsortPlayList,
    getPrevPlayPath, getNextPlayPath,
    selectedPlayList, setSelectedPlayList, appendSelectedPlayList,
    setSelectionBegin,
  } = usePlayListStore();

  const {
    setDropRef,
    dropRef,
  } = useReceivedDropFilesStore();

  const openDialogPlayList = async () => {
    const filter_ext = filter.map((ext)=> `*.${ext}`).join(";") // *.mp3;*.wav;*.ogg;*.m4a;*.opus;*.webm
    commands.dialogOpen({
      dialog_type: "OPEN",
      allow_multiple: true,
      file_types: [`Video files (${filter_ext})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if (files === null) { return }
        readFiles(files);
      }
    })
  }

  const openDialogOpenJson = async () => {
    commands.dialogOpen({
      dialog_type: "OPEN",
      allow_multiple: false,
      file_types: [`OpenVideo Book (${["*.json"].join(";")})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if(files === null) return;
        commands.readFile(files[0]).then(async (result) => {
          if (result.status === 'ok'){
            const files: string [] = JSON.parse(result.data);
            readFiles(files);
          }
        })
      }
    })
  }

  const readFiles = (files: string[]) => {
    console.log('setSetting readFiles')
    const setting = useMediaStore.getState().setting;
    const newPlayList = appendPlayList(setting.playList ?? [], files);
    const shuffledPlayList = setting.shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);
    let newPlayPath = setting.playPath;
    if (shuffledPlayList.length > 0) {
      newPlayPath = shuffledPlayList[0];
      setSelectionBegin(newPlayPath)
    }
    setPlayList(shuffledPlayList);
  }


  const openDialogSaveAsJson = async () => {
    const setting = useMediaStore.getState().setting;
    if (setting?.playList == null) return;
    commands.dialogOpen({
      dialog_type: "SAVE",
      allow_multiple: true,
      file_types: [`Save Video Book (${["*.json"].join(";")})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if (files === null) { return }
        const content = JSON.stringify(setting.playList, null, 2);
        commands.writeFile(files[0], content).then(async (result) => {
          if (result.status === 'ok'){
            toast.success("Success save");
          } else {
            toast.error("Fail save");
          }
        })
      }
    })
  }



  const clickTogglePlay = async () => {
    const newPaused = !setting.paused
    setSetting((setting) => ({...setting, caller: "clickTogglePlay", paused: newPaused}))
  }

  const playPrev = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getPrevPlayPath(setting.playPath);
    console.log('setSetting playPrev')
    setSetting((setting) => ({...setting, caller: "playPrev", playPath: newPlayPath, currentTime: 0}))
  }

  const playNext = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getNextPlayPath(setting.playPath);
    console.log('setSetting playNext')
    setSetting((setting) => ({...setting, caller: "playNext", playPath: newPlayPath, currentTime: 0}))
  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.key === "F11") {
      console.log('F11')
      toggleFullscreen().then()
    }
    const onKeyDownPlayList = usePlayListStore.getState().onKeyDownPlayList
    onKeyDownPlayList(e);

  }

  const toggleFullscreen = async () => {
    const fullscreen = useMediaStore.getState().fullscreen;
    if (fullscreen) {
      await document.exitFullscreen();
    } else {
      await pictureRef?.requestFullscreen()
    }
  }

  const onDropPlayPath = (file: string) => {
    const setting = useMediaStore.getState().setting;
    if (setting.playList === undefined) return;
    console.log('setSetting onDropPlayPath')
    if(setting.playList.indexOf(file) < 0) {
      appendSelectedPlayList([file]);
    }
    const newPlayList = appendPlayList(setting.playList, [file]);
    setSetting((setting) => ({...setting, caller: "onDropPlayPath", playPath: file, paused: false, playList: newPlayList}))
  };

  const onDropPlayList = (files: string[]) => {
    if(files.length === 0) return;
    const setting = useMediaStore.getState().setting;
    const playList = setting.playList ?? [];
    const addPlayList = files.filter((file) => playList.indexOf(file) < 0);
    const newPlayList = appendPlayList(playList, addPlayList);
    appendSelectedPlayList(addPlayList);
    console.log('setSetting onDropPlayList')
    setSetting((setting) => ({...setting, caller: "onDropPlayList", playList: newPlayList}))
  }

  useEffect(() => {
    const onDropFullPathHandler = (e: CustomEvent) => {
      setDropRef(null);
      console.log('onDropFullPathHandler', dropRef);
      const newDropFiles = e.detail as DropFile[];
      let files = newDropFiles
        .filter((file) => file.type.startsWith("image/"))
      if (filter.length > 0) {
        files = files.filter((file) => filter.some((ext) => file.pywebview_full_path.endsWith(`.${ext}`)))
      }
      const fullpathFiles = files.map((file) => file.pywebview_full_path);
      if (fullpathFiles.length == 0) {
        return;
      }
      if (dropRef?.classList.contains('drop-top')){
        console.log('drop-top');
        if (fullpathFiles.length == 1) {
          onDropPlayPath(fullpathFiles[0])
        } else {
          onDropPlayList(fullpathFiles)
        }
      } else if (dropRef?.classList.contains('drop-list')) {
        console.log('drop-list');
        onDropPlayList(fullpathFiles);
      }
    }
    dropRef?.addEventListener("drop-files", onDropFullPathHandler as EventListener)
    return () => {
      console.log('remove onDropTopHandler', dropRef);
      dropRef?.removeEventListener("drop-files", onDropFullPathHandler as EventListener)
    }
  }, [dropRef])

  const onMount = async () => {
    console.log('onMount')
    const result = await commands.appReadFile(PLAYER_SETTING);
    let newSetting: PictureSetting | null;

    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      if (result.data === "null") {
        newSetting = pictureDefault.setting ?? null;
      }
      commands.appWrite(PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', PLAYER_SETTING);
      })
    } else {
      newSetting = pictureDefault.setting ?? null;
      commands.appWrite(PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', PLAYER_SETTING);
      })
      commands.appWriteFile(PLAYER_SETTING, "null").then((result) => {
        console.log(result.status, 'appWriteFile', PLAYER_SETTING);
      })
    }
    const newPlayList = newSetting?.playList ?? []
    const newPlayPath = newSetting?.playPath ?? newPlayList[0];

    setSetting((_setting) => ({...newSetting, caller: "onMount", playPath: newPlayPath}))
    setPlayList(newPlayList)
    setPaused(newSetting?.paused ?? false)
    setSelectionBegin(newPlayPath)

  }

  const onUnMount = async () => {
    const ready = usePictureStore.getState().ready;
    console.log('onUnMount', ready)
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


  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      containerRef?.focus();
      onMount().then(() => {
        setReady(true);
      });
    }

    return () => {
      onUnMount().then()
    }
  }, [])

  return (
    <div className={`widget picture-player`}
         ref={setContainerRef}
         onKeyDown={onKeyDownHandler}
         tabIndex={0}
    >
      <SplitPane
        split="horizontal"
        // minSize={80} primary="first"
        minSize={0} primary="second"
        defaultSize={200}
      >
        <AutoSizer>
          {({height, width}) => (
            <div className="image-view drop-image"
                 ref={setPictureRef}
                 style={{width, height}}
            >
              <Grid className="image-list"
                    cellComponent={ImageListView}
                    cellProps={{imageList: []}}
                    columnCount={2}
                    columnWidth={500}
                    rowCount={2}
                    rowHeight={500}
              />

              {/*<ImageView  />*/}
            </div>
          )}
        </AutoSizer>
        <AutoSizer>
          {({ height, width }) => (
            <div className="controller" style={{width, height}}>
              <div className="top drop-top"
                   onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
              >
                <div className={`row time-line ${(!setting.paused && setting.playPath) ? 'playing' : ''}`}>
                </div>
                <div className="row first">
                  <div className="icon" onClick={openDialogPlayList} title="Open Video Files"><Icon icon={faFolderPlus}/></div>
                  <div className="icon" onClick={openDialogOpenJson} title="Open Video Book"><Icon icon={faBookMedical}/></div>
                  <div className="icon" onClick={openDialogSaveAsJson} title="Save Video Book"><Icon icon={faFloppyDisk}/></div>
                  <div className="icon badge-wrap"
                       onClick={() => {
                         setPlayList(playList.filter((path)=> !selectedPlayList.includes(path)))
                         setSelectedPlayList([])
                       }}
                       title="Delete Selection Files">
                    <Icon icon={faTrashCan} className={selectedPlayList.length > 0 ? '': 'inactive'}/>
                    {selectedPlayList.length > 0 && <div className="badge">{selectedPlayList.length}</div>}
                  </div>
                  <div className="sub badge-wrap" >
                  </div>
                  <div className="center">
                    <div className="icon" onClick={() => toggleShuffle()}>
                      <Icon icon={faShuffle} className={setting.shuffle ? '': 'inactive'}/>
                    </div>
                    <div className="icon" onClick={() => playPrev()}>
                      <Icon icon={faBackwardStep}/>
                    </div>
                    <div className="icon middle"
                         onClick={() => clickTogglePlay()}
                    >
                      <Icon icon={setting.paused ? faCirclePlay : faCirclePause } className={setting.paused ? 'blink': ''}/>
                    </div>
                    <div className="icon" onClick={() => playNext()}>
                      <Icon icon={faForwardStep}/>
                    </div>
                    {setting.repeat === 'repeat_all' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat All"><Icon icon={faArrowsSpin}/></div>}
                    {setting.repeat === 'repeat_one' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat One"><Icon icon={faRotateRight}/></div>}
                    {setting.repeat === 'repeat_none' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat Off"><Icon icon={faMinus}/></div>}
                  </div>

                  <div className="speed" title="Speed">
                  </div>
                  <div className="slider">
                  </div>
                  <div className="icon">
                  </div>
                  <div className="icon" onClick={() => toggleFullscreen()} title="Fullscreen(F11)">
                    <Icon icon={faExpand}/>
                  </div>

                </div>
                <div className="drop-list"
                     style={{ minHeight: "100%", height: "calc(100% - 85px)", width }}
                     onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
                >
                  <PlayListView
                    usePlayListStore={usePlayListStore}
                    icon={<Icon icon={faImage} />}
                  />
                </div>
              </div>
            </div>
          )}
        </AutoSizer>

      </SplitPane>
    </div>
  )
}
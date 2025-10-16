import "./MusicPlayerView.css"
import React, {useEffect, useState} from "react";
import {formatSeconds, srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts"
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {Menu, MenuButton, MenuItem} from "@szhsin/react-menu";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faBookMedical,
  faFolderPlus, faTrashCan,
  faCirclePlay, faCirclePause, faVolumeHigh, faVolumeMute,
  faBackwardStep, faForwardStep,
  faShuffle,
  faFloppyDisk,
  faArrowsSpin, faRotateRight, faMinus, faMusic,
} from '@fortawesome/free-solid-svg-icons'
import AudioView from "./AudioView.tsx";
import {audioDefault as mediaDefault, type PlayerSetting, useAudioStore as useMediaStore} from "../mediaStore.ts";
import type {DropFile} from "@/types/models";
import {useMusicPlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";
import PlayListView from "@/components/media/play-list/PlayListView.tsx";

export const PLAYER_SETTING = 'music-player.setting.json'

interface Prop {
  winKey: WinKey
}

export default function MusicPlayerView({winKey: _}: Prop) {
  const [initialized, setInitialized] = useState(false);

  const {
    mediaRef,
    containerRef, setContainerRef,
    changeVolume,
    changeCurrentTime,
    changeMuted,
    toggleRepeat,
    toggleShuffle,
    ended, setEnded,
    setting, setSetting,
    filter,
    changePlaybackRate,
    ready, setReady,
  } = useMediaStore();
  const {
    paused, setPaused,
    playPath, setPlayPath,
    playList, setPlayList,
    scrollPlayPath,
    appendPlayList, shufflePlayList, natsortPlayList,
    getPrevPlayPath, getNextPlayPath,
    checkedPlayList, setCheckedPlayList, appendCheckedPlayList,
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
      file_types: [`Audio files (${filter_ext})`]
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
      file_types: [`OpenAudio Book (${["*.json"].join(";")})`]
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
      file_types: [`Save Audio Book (${["*.json"].join(";")})`]
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


  const clickSpeed = (_e: any, speed: string) => {
    const v = Number(speed);
    setSetting((setting) => ({...setting, caller: "clickSpeed", playbackRate: v}))
    changePlaybackRate(v);
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
      await mediaRef?.requestFullscreen()
    }
  }

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [paused]", paused}))
  }, [paused]);

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playPath]", playPath}))
  }, [playPath])

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", playList: playList}))
  }, [playList])

  useEffect(() => {
    if(!ready) return;
    if(setting.paused !== undefined) {
      setPaused(setting.paused)
    }
  }, [setting.paused])

  useEffect(() => {
    if(!ready) return;
    if (setting.playList !== undefined) {
      setPlayList(setting.playList)
    }
  }, [setting.playList])

  useEffect(() => {
    const setting = useMediaStore.getState().setting;
    if(setting.playList === undefined) return;
    if(!ready) return;
    const shuffledPlayList = setting.shuffle ? shufflePlayList(setting.playList) : natsortPlayList(setting.playList);
    console.log('shuffle', setting.shuffle, setting.playList, shuffledPlayList);
    setSetting((setting) => ({...setting, caller: "useEffect[setting.shuffle]", playList: shuffledPlayList}))
  }, [setting.shuffle])

  useEffect(() => {
    const setting = useMediaStore.getState().setting;
    if (setting.playList === undefined) return;
    if (mediaRef === null) return;
    if (ended) {
      setEnded(false);
      if (setting.playList.length == 0) {
        return;
      }
      if (setting.repeat === 'repeat_all') {
        if (setting.playList.length == 0) return;
        let idx = setting.playList.indexOf(setting.playPath || '');

        let shuffledPlayList = setting.playList;
        if (idx === setting.playList.length -1) {
          if (setting.shuffle) {
            shuffledPlayList = shufflePlayList(setting.playList);
          }
          idx = 0
        } else {
          idx++;
        }

        const nextPlay = shuffledPlayList[idx]
        console.log('setSetting useEffect[ended] repeat_all')
        setSetting((setting) => ({...setting, caller: "useEffect[ended] repeat_all", playPath: nextPlay, playList: shuffledPlayList, currentTime: 0}))
      } else if (setting.repeat === 'repeat_one') {
        console.log('setSetting useEffect[ended] repeat_one')
        if (setting.playPath) {
          setSetting((setting) => ({...setting, caller: "useEffect[ended] repeat_one", playPath: setting.playPath, currentTime: 0}))
          if (setting.paused !== mediaRef.paused) {
            if (setting.paused) {
              mediaRef.pause();
            } else {
              mediaRef.play().then();
            }
          }
        }
      } else if (setting.repeat === 'repeat_none') {
        console.log('setSetting useEffect[ended] repeat_none')
        setSetting((setting) => ({...setting, caller: "useEffect[ended] repeat_none", paused: true}))
      }
    }
  }, [ended])

  useEffect(() => {
    const state = useMediaStore.getState();
    const setting = useMediaStore.getState().setting;
    if(setting === null) return;
    if(!state.ready) return;
    console.log('setting', setting);
    commands.appWrite(PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', PLAYER_SETTING);
    })
  }, [setting])

  useEffect(() => {
    console.log('ready', ready)
  }, [ready])

  const onMount = async () => {
    console.log('onMount')
    const result = await commands.appReadFile(PLAYER_SETTING);
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

    setSetting((_setting) => ({...newSetting, caller: "onMount", playPath: newPlayPath, currentTime: newCurrenTime}))
    setPlayList(newPlayList)
    setPaused(newSetting?.paused ?? false)
    setSelectionBegin(newPlayPath)

  }

  const onUnMount = async () => {
    const ready = useMediaStore.getState().ready;
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

  const onDropPlayPath = (file: string) => {
    const setting = useMediaStore.getState().setting;
    if (setting.playList === undefined) return;
    console.log('setSetting onDropPlayPath')
    if(setting.playList.indexOf(file) < 0) {
      appendCheckedPlayList([file]);
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
    appendCheckedPlayList(addPlayList);
    console.log('setSetting onDropPlayList')
    setSetting((setting) => ({...setting, caller: "onDropPlayList", playList: newPlayList}))
  }

  useEffect(() => {
    const newMuted = setting.volume == 0;
    changeMuted(newMuted);
    setSetting((setting) => ({...setting, caller: "useEffect[setting.volume]", muted: newMuted}))
  }, [setting.volume])

  useEffect(() => {
    if (setting?.playPath == null) return;
    console.log('fetch HEAD');
    fetch(srcLocal(setting.playPath), {method: "HEAD"})
      .then( (res) => {
        if (res.ok) {
          setPlayPath(setting.playPath)
          setSelectionBegin(setting.playPath)
          scrollPlayPath(setting.playList ?? [], setting.playPath)
        } else {
          toast.error( `Fail ${setting.playPath}`);
          console.log('fetch error', res.status);
          const newPlayPath = getNextPlayPath(setting.playPath)
          console.log('setSetting fetch')
          setSetting((setting) => ({...setting, caller: "useEffect [setting.playPath] fetch", currentTime: 0, playPath: newPlayPath}))
          setPlayPath(newPlayPath);
          setSelectionBegin(newPlayPath);
          scrollPlayPath(setting.playList ?? [], newPlayPath)
        }
      })
    ;
  }, [setting.playPath]);

  useEffect(() => {
    const onDropFullPathHandler = (e: CustomEvent) => {
      setDropRef(null);
      console.log('onDropFullPathHandler', dropRef);
      const newDropFiles = e.detail as DropFile[];
      let files = newDropFiles
        .filter((file) => file.type.startsWith("audio/"))
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
    <div className={`widget music-player`}
         ref={setContainerRef}
         onKeyDown={onKeyDownHandler}
         tabIndex={0}
    >
      <div className="audio-player">
        <AudioView />
      </div>
      <div className="top drop-top"
           onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
      >
        <div className={`row time-line ${(!mediaRef?.paused && setting.playPath) ? 'playing' : ''}`}>
          <div className="tm">{formatSeconds(setting.currentTime ?? 0)}</div>
          <div className="slider">
            <input type="range" min={0} max={mediaRef?.duration || 0} step={1}
                   value={setting.currentTime ?? 0}
                   onChange={(e) => {
                     const tm = Number(e.target.value);
                     console.log('change currentTime', tm);
                     setSetting({...setting, caller: "input range", currentTime: tm});
                     changeCurrentTime(tm);
                   }}/>
          </div>
          <div className="tm">{formatSeconds(mediaRef?.duration ?? 0)}</div>
        </div>

        <div className="row first">
          <div className="icon" onClick={openDialogPlayList} title="Open Audio Files"><Icon icon={faFolderPlus}/></div>
          <div className="icon" onClick={openDialogOpenJson} title="Open Audio Book"><Icon icon={faBookMedical}/></div>
          <div className="icon" onClick={openDialogSaveAsJson} title="Save Audio Book"><Icon icon={faFloppyDisk}/></div>
          <div className="icon badge-wrap"
               onClick={() => {
                 setPlayList(playList.filter((path)=> !checkedPlayList.includes(path)))
                 setCheckedPlayList([])
               }}
               title="Delete Selection Files">
            <Icon icon={faTrashCan} className={checkedPlayList.length > 0 ? '': 'inactive'}/>
            {checkedPlayList.length > 0 && <div className="badge">{checkedPlayList.length}</div>}
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
              <Icon icon={mediaRef?.paused ? faCirclePlay : faCirclePause } className={mediaRef?.paused ? 'blink': ''}/>
            </div>
            <div className="icon" onClick={() => playNext()}>
              <Icon icon={faForwardStep}/>
            </div>
            {setting.repeat === 'repeat_all' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat All"><Icon icon={faArrowsSpin}/></div>}
            {setting.repeat === 'repeat_one' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat One"><Icon icon={faRotateRight}/></div>}
            {setting.repeat === 'repeat_none' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat Off"><Icon icon={faMinus}/></div>}
          </div>
          <div className="speed" title="Speed">
            <Menu menuButton={<MenuButton className="menu-select">x{setting?.playbackRate || "1"}</MenuButton>} transition>
              <MenuItem className={`menu-item ${setting?.playbackRate == 0.25 ? 'selected': ''}`} value="0.25" onClick={(e: any) => clickSpeed(e, e.value)}>x0.25</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 0.5 ? 'selected': ''}`} value="0.5" onClick={(e: any) => clickSpeed(e, e.value)}>x0.5</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 0.75 ? 'selected': ''}`} value="0.75" onClick={(e: any) => clickSpeed(e, e.value)}>x0.75</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 1 ? 'selected': ''}`} value="1" onClick={(e: any) => clickSpeed(e, e.value)}>x1</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 1.25 ? 'selected': ''}`} value="1.25" onClick={(e: any) => clickSpeed(e, e.value)}>x1.25</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 1.5 ? 'selected': ''}`} value="1.5" onClick={(e: any) => clickSpeed(e, e.value)}>x1.5</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 1.75 ? 'selected': ''}`} value="1.75" onClick={(e: any) => clickSpeed(e, e.value)}>x1.75</MenuItem>
              <MenuItem className={`menu-item ${setting?.playbackRate == 2 ? 'selected': ''}`} value="2" onClick={(e: any) => clickSpeed(e, e.value)}>x2</MenuItem>
            </Menu>
          </div>

          <div className="slider">
            <input type="range" min={0} max={1} step={0.1}
                   value={setting?.volume || 0}
                   onChange={(e) => {
                     let v = Number(e.target.value);
                     console.log('change volume', v);
                     setSetting({...setting, caller: "input range", volume: v});
                     changeVolume(v);
                   }}/>
          </div>
          <div className="icon"
               onClick={
                () => {
                  const newMuted = !setting.muted;
                  let newVolume = setting?.volume ?? 0;
                  if(!newMuted && setting?.volume === 0) {
                    newVolume = 0.5;
                  }
                  setSetting({...setting, caller: "mute click", muted: newMuted, volume: newVolume})
                  changeMuted(newMuted)
                  changeVolume(newVolume)
                }
            }>
            <Icon icon={setting.muted ? faVolumeMute : faVolumeHigh} className={setting?.muted ? 'blink': ''}/>
          </div>
        </div>
      </div>
      <div className="play-list drop-list"
           onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
      >
        <PlayListView
          usePlayListStore={usePlayListStore}
          icon={<Icon icon={faMusic} />}
        />
      </div>
    </div>
  )
}



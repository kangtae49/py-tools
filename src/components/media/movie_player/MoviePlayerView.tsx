import "./MoviePlayerView.css"
import React, {type ChangeEvent, useEffect, useRef, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faBookMedical,
  faFolderPlus, faTrashCan,
  faCirclePlay, faCirclePause, faVolumeHigh, faVolumeMute,
  faBackwardStep, faForwardStep,
  faShuffle,
  faFloppyDisk,
  faArrowsSpin, faRotateRight, faMinus, faFilm, faExpand,
} from '@fortawesome/free-solid-svg-icons'
import {List} from 'react-window'
import MoviePlayListRowView from "./MoviePlayListRowView.tsx";
import VideoView from "./VideoView.tsx";
import {useMoviePlayListStore} from "./moviePlayListStore.ts";
import {useSelectedMoviePlayListStore} from "./selectedMoviePlayListStore.ts";
import {videoDefault, type PlayerSetting, useVideoStore} from "../mediaStore.ts";
import {formatSeconds, getFilename, srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts"
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {DropFile} from "@/types/models";
import {type WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import {Menu, MenuButton, MenuItem} from "@szhsin/react-menu";

export const MOVIE_PLAYER_SETTING = 'movie-player.setting.json'

interface Prop {
  winKey: WinKey
}

export default function MoviePlayerView({winKey: _}: Prop) {
  const [initialized, setInitialized] = useState(false);
  const [_isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    setPlayListRef,
    scrollPlayPath,
  } = useMoviePlayListStore();
  const {
    selectedPlayList, setSelectedPlayList, removeSelectedPlayList, appendSelectedPlayList,
    selectionBegin, setSelectionBegin,
  } = useSelectedMoviePlayListStore();
  const {
    mediaRef,
    changeVolume,
    changeCurrentTime,
    changeMuted,
    toggleRepeat,
    toggleShuffle,
    ended, setEnded,
    setting, setSetting,
    filter,
    appendPlayList, removePlayList, shufflePlayList, natsortPlayList,
    getPrevPlayPath, getNextPlayPath,
    changePlaybackRate,
    ready, setReady,
    subs,
  } = useVideoStore();
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
    if(setting?.playList == null) return;
    const newPlayList = appendPlayList(setting.playList, files);
    const shuffledPlayList = setting?.shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);
    let newPlayPath = setting.playPath;
    if (newPlayPath == undefined && shuffledPlayList.length > 0) {
      newPlayPath = shuffledPlayList[0];
      setSelectionBegin(newPlayPath)
    }
    const newSetting: PlayerSetting = {...setting, caller: "readFiles", playPath: newPlayPath || undefined, playList: shuffledPlayList}
    console.log('setSetting readFiles')
    setSetting(newSetting)
  }


  const openDialogSaveAsJson = async () => {
    const setting = useVideoStore.getState().setting;
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

  const clickRemovePlayList = () => {
    const setting = useVideoStore.getState().setting;
    if (setting?.playList == null) return;
    if (selectedPlayList.length == 0) return;

    const beginPos = setting.playList.indexOf(selectionBegin ||'');

    const newPlayList = removePlayList(setting.playList, selectedPlayList);
    removeSelectedPlayList(selectedPlayList);
    setSelectedPlayList([])
    if (newPlayList.length > 0) {
      if (newPlayList.indexOf(selectionBegin || '') >= 0) {
        setSelectionBegin(selectionBegin)
      } else {
        let newBeginPos = Math.max(beginPos, 0);
        newBeginPos = Math.min(newBeginPos, newPlayList.length - 1);
        setSelectionBegin(newPlayList[newBeginPos])
      }
    }
    console.log('setSetting clickRemovePlayList')
    setSetting({...setting, caller: "clickRemovePlayList", playList: newPlayList})
  }

  const clickTogglePlay = async () => {
    const setting = useVideoStore.getState().setting;
    if(setting === null) return;
    setSetting({...setting, caller: "clickTogglePlay", paused: !setting.paused})
  }

  const clickVideo = (e: React.MouseEvent) => {
    const state = useVideoStore.getState();
    if (state.setting === null) return;
    if (!state.fullscreen) {
      setSetting({...setting, caller: "clickVideo", paused: !state.setting.paused})
    }
    console.log('clickVideo', e);
  }

  const clickSpeed = (_e: any, speed: string) => {
    const setting = useVideoStore.getState().setting;
    const v = Number(speed);
    setSetting({...setting, caller: "clickSpeed", playbackRate: v})
    changePlaybackRate(v);
  }

  const clickSubType = (_e: any, subType: string) => {
    useVideoStore.getState().changeAllTrackMode('disabled');
    const setting = useVideoStore.getState().setting;
    let newSubType = undefined;
    if (subType !== '') newSubType = subType;
    setSetting({...setting, caller: "clickSubType", subType: newSubType})
  }

  const playPrev = () => {
    const setting = useVideoStore.getState().setting;
    if(setting?.playPath == null) return;
    const newPlayPath = getPrevPlayPath(setting.playPath);
    if (newPlayPath == null) return
    console.log('setSetting playPrev')
    setSetting({...setting, caller: "playPrev", currentTime: 0, playPath: newPlayPath})
  }

  const playNext = () => {
    const setting = useVideoStore.getState().setting;
    if(setting?.playPath == null) return;
    const newPlayPath = getNextPlayPath(setting.playPath);
    if (newPlayPath == null) return
    console.log('setSetting playNext')
    setSetting({...setting, caller: "playNext", currentTime: 0, playPath: newPlayPath})
  }

  const onKeyDownHandler = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const setting = useVideoStore.getState().setting;
    const selectionBegin = useSelectedMoviePlayListStore.getState().selectionBegin;

    if (setting?.playList == null) return;
    e.preventDefault()
    window.getSelection()?.removeAllRanges();
    if (setting.playList.length == 0) return;

    if (e.ctrlKey && e.key === 'a') {
      setSelectedPlayList(setting.playList);
    } else if (e.key === "Delete") {
      clickRemovePlayList();
    } else if (e.key === "ArrowLeft") {
      if(setting.playPath == null) return;
      const newPlayPath = getPrevPlayPath(setting.playPath)
      if (newPlayPath == null) return
      console.log('setSetting ArrowLeft')
      setSetting({...setting, caller: "onKeyDownHandler", currentTime: 0, playPath: newPlayPath})
      scrollPlayPath(setting?.playList, newPlayPath)
    } else if (e.key === "ArrowRight") {
      if(setting.playPath == null) return;
      const newPlayPath = getNextPlayPath(setting.playPath)
      if (newPlayPath == null) return
      console.log('setSetting ArrowRight')
      setSetting({...setting, caller: "onKeyDownHandler", currentTime: 0, playPath: newPlayPath})
      scrollPlayPath(setting?.playList, newPlayPath)
    } else if (e.key === "Enter") {
      if (selectionBegin !== null) {
        console.log('setSetting Enter')
        setSetting({...setting, caller: "onKeyDownHandler", paused: false, playPath: selectionBegin})
      }
    } else if (e.key === "ArrowUp") {
      if (selectionBegin == null) {
        setSelectionBegin(setting.playList[0])
        scrollPlayPath(setting?.playList, setting.playList[0])
        return;
      }
      let newSelection = getPrevPlayPath(selectionBegin)
      if (newSelection === null) {
        newSelection = setting.playList[0]
      }
      setSelectionBegin(newSelection)
      scrollPlayPath(setting?.playList, newSelection)
    } else if (e.key === "ArrowDown") {
      if (selectionBegin == null) {
        setSelectionBegin(setting.playList[0])
        scrollPlayPath(setting?.playList, setting.playList[0])
        return;
      }
      let newSelection = getNextPlayPath(selectionBegin)
      if (newSelection === null) {
        newSelection = setting.playList[0]
      }
      setSelectionBegin(newSelection)
      scrollPlayPath(setting?.playList, newSelection)
    } else if (e.key === " ") {
      if (selectionBegin == null) {
        setSelectionBegin(setting.playList[0])
        scrollPlayPath(setting?.playList, setting.playList[0])
        return;
      }
      const pos = selectedPlayList.indexOf(selectionBegin);
      if (pos >= 0) {
        removeSelectedPlayList([selectionBegin])
      } else {
        appendSelectedPlayList([selectionBegin])
      }
    }
    else if (e.key === "F11") {
      console.log('F11')
      toggleFullscreen().then();
    }
  }

  const changeAllChecked = (e: ChangeEvent<HTMLInputElement>) => {
    const setting = useVideoStore.getState().setting;
    if (setting?.playList == null) return;
    let newPlayList: string[] = []
    if (e.target.checked) {
      newPlayList = [...setting.playList]
    }
    setSelectedPlayList(newPlayList)
  }

  const toggleFullscreen = async () => {
    const fullscreen = useVideoStore.getState().fullscreen;
    if (fullscreen) {
      await document.exitFullscreen();
      containerRef.current?.focus();
    } else {
      await mediaRef?.requestFullscreen()
      mediaRef?.focus();
    }
  }

  useEffect(() => {
    const setting = useVideoStore.getState().setting;
    if(setting?.playList == null) return;
    if(!ready) return;
    const shuffledPlayList = setting.shuffle ? shufflePlayList(setting.playList) : natsortPlayList(setting.playList);
    console.log('shuffle', setting.shuffle, setting.playList, shuffledPlayList);
    setSetting({...setting, caller: "useEffect[setting?.shuffle, ready]", playList: shuffledPlayList})
  }, [setting?.shuffle])

  useEffect(() => {
    if (setting === null) return;
    if (setting?.playList == null) return;
    if (mediaRef == null) return;
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
        setSetting({...setting, caller: "useEffect[ended]", currentTime: 0, playPath: nextPlay, playList: shuffledPlayList})
      } else if (setting?.repeat === 'repeat_one') {
        console.log('setSetting useEffect[ended] repeat_one')
        if (setting.playPath) {
          setSetting({...setting, caller: "useEffect[ended]", playPath: setting.playPath, currentTime: 0})
        }
      } else if (setting.repeat === 'repeat_none') {
        console.log('setSetting useEffect[ended] repeat_none')
        setSetting({...setting, caller: "useEffect[ended]", paused: true})
      }
    }
  }, [ended])

  useEffect(() => {
    const state = useVideoStore.getState();
    const setting = useVideoStore.getState().setting;
    if(setting === null) return;
    if(!state.ready) return;
    console.log('setting', setting);
    commands.appWrite(MOVIE_PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', MOVIE_PLAYER_SETTING);
    })
  }, [setting])

  useEffect(() => {
    console.log('ready', ready)
  }, [ready])

  const onMount = async () => {
    console.log('onMount')
    const result = await commands.appReadFile(MOVIE_PLAYER_SETTING);
    let newSetting: PlayerSetting | null;

    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      if (result.data === "{}") {
        newSetting = videoDefault.setting ?? null;
      }
      commands.appWrite(MOVIE_PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', MOVIE_PLAYER_SETTING);
      })
    } else {
      newSetting = videoDefault.setting ?? null;
      commands.appWrite(MOVIE_PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', MOVIE_PLAYER_SETTING);
      })
      commands.appWriteFile(MOVIE_PLAYER_SETTING, "{}").then((result) => {
        console.log(result.status, 'appWriteFile', MOVIE_PLAYER_SETTING);
      })
    }
    const newPlayList = newSetting?.playList ?? []
    const newPlayPath = newSetting?.playPath ?? newPlayList[0];

    newSetting = {...newSetting, caller: "onMount", playPath: newPlayPath}
    setSetting(newSetting)
    setSelectionBegin(newPlayPath)

  }

  const onUnMount = async () => {
    console.log('onUnMount')
    const result = await commands.appRead(MOVIE_PLAYER_SETTING);
    if (result.status === 'ok') {
      commands.appWriteFile(MOVIE_PLAYER_SETTING, "{}").then((result) => {
        console.log(result.status, 'appWriteFile', MOVIE_PLAYER_SETTING);
      })
    }
  }

  const onDropPlayPath = (file: string) => {
    const setting = useVideoStore.getState().setting;
    if (setting?.playList == null) return;
    console.log('setSetting onDropPlayPath')
    if(setting.playList.indexOf(file) < 0) {
      appendSelectedPlayList([file]);
    }
    const newPlayList = appendPlayList(setting.playList, [file]);
    setSetting({...setting, caller: "onDropPlayPath", playPath: file, paused: false, playList: newPlayList})
  };

  const onDropPlayList = (files: string[]) => {
    const setting = useVideoStore.getState().setting;
    if (setting?.playList == null) return;
    const addPlayList = files.filter((file) => setting.playList!.indexOf(file) < 0);
    const newPlayList = appendPlayList(setting.playList, addPlayList);
    appendSelectedPlayList(addPlayList);
    console.log('setSetting onDropPlayList')
    setSetting({...setting, caller: "onDropPlayList", playList: newPlayList})
  }

  useEffect(() => {
    if (setting === null) return;
    const newMuted = setting.volume == 0;
    changeMuted(newMuted);
    setSetting({...setting, caller: "useEffect[setting?.volume]", muted: newMuted})
  }, [setting?.volume])

  useEffect(() => {
    if (setting?.playPath == null) return;
    console.log('fetch HEAD');
    fetch(srcLocal(setting.playPath), {method: "HEAD"})
      .then( (res) => {
        if (res.ok) {
          commands.getSubs(setting.playPath!).then((result) => {
            const state = useVideoStore.getState();
            if (result.status === 'ok') {
              const subs = result.data;
              state.setSubs(subs)
            } else {
              state.setSubs([])
              // state.setSetting({...state.setting, caller: "fetch", subType: undefined})
            }
          })
        } else {
          const state = useVideoStore.getState();
          state.setSubs([])
          // state.setSetting({...state.setting, caller: "fetch", subType: undefined})
          toast.error( `Fail ${setting.playPath}`);
          console.log('fetch error', res.status);
          const newPlayPath = getNextPlayPath(setting?.playPath ?? null)
          if (newPlayPath == null) return
          console.log('setSetting fetch')
          state.setSetting({...state.setting, caller: "fetch", currentTime: 0, playPath: newPlayPath})
          scrollPlayPath(state.setting!.playList!, newPlayPath)
          return;
        }
      })
    ;
  }, [setting?.playPath]);

  useEffect(() => {
    const onDropFullPathHandler = (e: CustomEvent) => {
      setDropRef(null);

      console.log('onDropTopHandler', dropRef);
      const newDropFiles = e.detail as DropFile[];
      let files = newDropFiles
        .filter((file) => file.type.startsWith("video/"))
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
      containerRef.current?.focus();
      onMount().then(() => {
        setReady(true);
      });
    }

    return () => {
      onUnMount().then()
    }
  }, [])
  if (setting === null) return null;
  return (
    <div className={`widget movie-player`}
         ref={containerRef}
         onKeyDown={onKeyDownHandler} tabIndex={0}
    >
      <SplitPane
        split="horizontal"
        minSize={50}
        primary="second"
        defaultSize={200}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
      >
        <AutoSizer>
          {({ height, width }) => (
            <div className="video-player"
                 style={{width, height}}
                 onClick={clickVideo}
            >
              <VideoView  />
            </div>
            )
          }
        </AutoSizer>
        <AutoSizer>
          {({ height, width }) => (
          <div className="controller" style={{width, height}}>
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
                <div className="icon" onClick={openDialogPlayList} title="Open Video Files"><Icon icon={faFolderPlus}/></div>
                <div className="icon" onClick={openDialogOpenJson} title="Open Video Book"><Icon icon={faBookMedical}/></div>
                <div className="icon" onClick={openDialogSaveAsJson} title="Save Video Book"><Icon icon={faFloppyDisk}/></div>
                <div className="icon badge-wrap" onClick={clickRemovePlayList} title="Delete Selection Files">
                  <Icon icon={faTrashCan} className={selectedPlayList.length > 0 ? '': 'inactive'}/>
                  {selectedPlayList.length > 0 && <div className="badge">{selectedPlayList.length}</div>}
                </div>
                <div className="sub" title="Subtitles">
                  <Menu menuButton={<MenuButton className="menu-select">{setting?.subType ?? '-'}</MenuButton>} transition>
                    <MenuItem className={`menu-item ${setting?.subType == null ? 'selected': ''}`} value="" onClick={(e: any) => clickSubType(e, e.value)}>-</MenuItem>
                    { subs && subs.map((sub, _index) => (
                      <MenuItem key={sub.fullpath} className={`menu-item ${setting?.subType == sub.subtype ? 'selected': ''}`} value={sub.subtype} onClick={(e: any) => clickSubType(e, e.value)}>{sub.subtype}</MenuItem>
                    ))}
                  </Menu>
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
                <div className="icon" onClick={() => toggleFullscreen()} title="Fullscreen(F11)">
                  <Icon icon={faExpand}/>
                </div>

              </div>
              <div className={`row second`}>
                <div><input type="checkbox" onChange={changeAllChecked}/></div>
                <Icon icon={faFilm} />
                <div className="title"
                     title={setting.playPath ?? ''}
                     onClick={() => {setting.playPath && scrollPlayPath(setting.playList ?? [], setting.playPath)}}
                >{getFilename(setting.playPath ?? '')}</div>
              </div>
            </div>
            <div className="play-list-con drop-list"
                 style={{ height: "calc(100% - 105px)", width }}
                 onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
            >
              <List className="play-list"
                    listRef={setPlayListRef}
                    rowHeight={22}
                    rowCount={setting.playList?.length ?? 0}
                    rowComponent={MoviePlayListRowView}
                    rowProps={{ playList: setting.playList ?? []}}
              />
            </div>
          </div>
        )}
        </AutoSizer>
      </SplitPane>
    </div>
  )
}



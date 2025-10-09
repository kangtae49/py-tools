import "./MusicPlayerView.css"
import React, {type ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
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
import {List,  type ListImperativeAPI} from 'react-window'
import MusicPlayListRowView from "./MusicPlayListRowView.tsx";
import AudioView from "./AudioView.tsx";
import {useMusicPlayListStore} from "./musicPlayListStore.ts";
import {useSelectedMusicPlayListStore} from "./selectedMusicPlayListStore.ts";
import {type PlayerSetting, useAudioStore} from "../mediaStore.ts";
import {formatSeconds, getFilename, srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts"
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {DropFile} from "@/types/models";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

export const MUSIC_PLAYER_SETTING = 'music-player.setting.json'

interface Prop {
  winKey: WinKey
}

export default function MusicPlayerView({winKey: _}: Prop) {
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI>(null);
  const {
    setPlayListRef,
    scrollPlayPath,
  } = useMusicPlayListStore();
  const {
    selectedPlayList, setSelectedPlayList, removeSelectedPlayList, appendSelectedPlayList,
    selectionBegin, setSelectionBegin,
  } = useSelectedMusicPlayListStore();
  const {
    mediaRef,
    togglePlay,
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
  } = useAudioStore();
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

  const readFiles = useCallback((files: string[]) => {
    if(setting?.playList == null) return;
    const newPlayList = appendPlayList(setting.playList, files);
    const shuffledPlayList = setting?.shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);
    let newPlayPath = setting.playPath;
    if (newPlayPath == undefined && shuffledPlayList.length > 0) {
      newPlayPath = shuffledPlayList[0];
      setSelectionBegin(newPlayPath)
    }
    const newSetting: PlayerSetting = {...setting, playPath: newPlayPath || undefined, playList: shuffledPlayList}
    console.log('setSetting readFiles')
    setSetting(newSetting)
  }, [setting])


  const openDialogSaveAsJson = useCallback(async () => {
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
  }, [setting])

  const clickRemovePlayList = useCallback(() => {
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
    setSetting({...setting, playList: newPlayList})
  }, [setting, selectedPlayList])

  const clickTogglePlay = useCallback(async () => {
    if(setting === null) return;
    setSetting({...setting, paused: !setting.paused})
    togglePlay().then();
  }, [setting])

  const playPrev = useCallback(() => {
    if(setting?.playPath == null) return;
    const newPlayPath = getPrevPlayPath(setting.playPath);
    if (newPlayPath == null) return
    console.log('setSetting playPrev')
    setSetting({...setting, currentTime: 0, playPath: newPlayPath})
  }, [setting]);

  const playNext = useCallback(() => {
    if(setting?.playPath == null) return;
    const newPlayPath = getNextPlayPath(setting.playPath);
    if (newPlayPath == null) return
    console.log('setSetting playNext')
    setSetting({...setting, currentTime: 0, playPath: newPlayPath})
  }, [setting]);

  const onKeyDownHandler = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
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
      setSetting({...setting, currentTime: 0, playPath: newPlayPath})
      scrollPlayPath(setting?.playList, newPlayPath)
    } else if (e.key === "ArrowRight") {
      if(setting.playPath == null) return;
      const newPlayPath = getNextPlayPath(setting.playPath)
      if (newPlayPath == null) return
      console.log('setSetting ArrowRight')
      setSetting({...setting, currentTime: 0, playPath: newPlayPath})
      scrollPlayPath(setting?.playList, newPlayPath)
    } else if (e.key === "Enter") {
      if (selectedPlayList.length == 1) {
        console.log('setSetting Enter')
        setSetting({...setting, paused: false, playPath: selectedPlayList[0]})
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
  }, [setting, selectionBegin])
  const changeAllChecked = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (setting?.playList == null) return;
    let newPlayList: string[] = []
    if (e.target.checked) {
      newPlayList = [...setting.playList]
    }
    setSelectedPlayList(newPlayList)
  }, [setting])

  useEffect(() => {
    if(setting?.playList == null) return;
    if(!ready) return;
    console.log('shuffle');
    const shuffledPlayList = setting?.shuffle ? shufflePlayList(setting.playList) : natsortPlayList(setting.playList);
    setSetting({...setting, playList: shuffledPlayList})
  }, [setting?.shuffle, ready])

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
        setSetting({...setting, currentTime: 0, playPath: nextPlay, playList: shuffledPlayList})
        if(!setting?.paused) {
          mediaRef.play()?.then();
        }
      } else if (setting?.repeat === 'repeat_one') {
        console.log('setSetting useEffect[ended] repeat_one')
        if (setting.playPath) {
          setSetting({...setting, playPath: setting.playPath, currentTime: 0})
          if(!setting?.paused) {
            mediaRef.play()?.then();
          }
        }
      } else if (setting.repeat === 'repeat_none') {
        setSetting({...setting, paused: true})
        mediaRef.pause();
      }
    }
  }, [ended])

  useEffect(() => {
    if(setting === null) return;
    console.log('setting', setting);
    commands.appWrite(MUSIC_PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', MUSIC_PLAYER_SETTING);
    })
  }, [setting])

  useEffect(() => {
    console.log('ready', ready)
    if (!ready) return;
    if (setting === null) return;
    console.log('playList ready', setting.playList, ready);
    setSetting({...setting, playList: setting.playList})
    // changeCurrentTime(setting.currentTime)
    if(setting.paused) {
      mediaRef?.pause();
    } else {
      mediaRef?.play().then();
    }

  }, [ready])

  useEffect(() => {
    if (listRef?.current !== null) {
      setPlayListRef(listRef.current);
    }
  }, [listRef?.current])


  const onMount = async () => {
    const result = await commands.appReadFile(MUSIC_PLAYER_SETTING);
    let newSetting: PlayerSetting | null;

    const defaultSetting: PlayerSetting = {
      playPath: undefined,
      currentTime: 0,
      volume: 0.5,
      playbackRate: 1.0,
      muted: false,
      paused: true,
      shuffle: true,
      repeat: "repeat_all",
      playList: []
    }
    if(result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      if (result.data === "{}") {
        newSetting = defaultSetting;
      }
    } else {
      newSetting = defaultSetting;
    }
    console.log('setting', newSetting);
    const newPlayList = newSetting?.playList ?? []
    // const shuffledPlayList = newSetting?.shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);
    // const newPlayPath = setting?.playPath ?? shuffledPlayList[0];
    console.log('onMount playPath', newSetting?.playPath)
    const newPlayPath = newSetting?.playPath ?? newPlayList[0];

    newSetting = {...newSetting, playPath: newPlayPath}
    console.log('onMount setSetting')
    setSetting(newSetting)
    setSelectionBegin(newPlayPath)

    commands.appWrite(MUSIC_PLAYER_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', MUSIC_PLAYER_SETTING);
    })
  }

  const onUnMount = async () => {

    const result = await commands.appRead(MUSIC_PLAYER_SETTING);
    if (result.status === 'ok') {
      commands.appWriteFile(MUSIC_PLAYER_SETTING, "{}").then((result) => {
        console.log(result.status, 'appWriteFile', MUSIC_PLAYER_SETTING);
      })
    }
  }

  const onDropPlayPath = useCallback((file: string) => {
    if (setting?.playList == null) return;
    console.log('setSetting onDropPlayPath')
    const newPlayList = appendPlayList(setting.playList, [file]);
    setSetting({...setting, playPath: file, paused: false, playList: newPlayList})
    appendSelectedPlayList([file]);
  }, [setting?.playList]);

  const onDropPlayList = useCallback((files: string[]) => {
    if (setting?.playList == null) return;
    const addPlayList = files.filter((file) => setting.playList!.indexOf(file) < 0);
    const newPlayList = appendPlayList(setting.playList, addPlayList);
    appendSelectedPlayList(addPlayList);
    console.log('setSetting onDropPlayList')
    setSetting({...setting, playList: newPlayList})
  }, [setting?.playList]);

  useEffect(() => {
    if (setting === null) return;
    const newMuted = setting.volume == 0;
    changeMuted(newMuted);
    setSetting({...setting, muted: newMuted})
  }, [setting?.volume])

  useEffect(() => {
    if (setting?.playPath == null) return;
    fetch(srcLocal(setting.playPath), {method: "HEAD"})
      .then( (res) => {
        if(!res.ok) {
          toast.error( `Fail ${setting.playPath}`);
          console.log('fetch error', res.status);
          const newPlayPath = getNextPlayPath(setting?.playPath ?? null)
          if (newPlayPath == null) return
          console.log('setSetting ArrowRight')
          setSetting({...setting, currentTime: 0, playPath: newPlayPath})
          scrollPlayPath(setting?.playList ?? [], newPlayPath)
        }
      })
    ;
  }, [setting]);

  useEffect(() => {
    const onDropFullPathHandler = (e: CustomEvent) => {
      setDropRef(null);

      console.log('onDropTopHandler', dropRef);
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
      containerRef.current?.focus();
      onMount().then(() => {
        setReady(true);
        console.log('ready', true)
      });
    }

    return () => {
      onUnMount().then()
    }
  }, [])
  if (setting === null) return null;
  return (
    <div className={`widget music-player`}
         ref={containerRef}
         onKeyDown={onKeyDownHandler} tabIndex={0}
    >
      <AudioView />
      <div className="top drop-top"
           onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
      >
        <div className="row first">
          <div className="icon" onClick={openDialogPlayList} title="Open Audio Files"><Icon icon={faFolderPlus}/></div>
          <div className="icon" onClick={openDialogOpenJson} title="Open Audio Book"><Icon icon={faBookMedical}/></div>
          <div className="icon" onClick={openDialogSaveAsJson} title="Save Audio Book"><Icon icon={faFloppyDisk}/></div>
          <div className="icon badge-wrap" onClick={clickRemovePlayList} title="Delete Selection Files">
            <Icon icon={faTrashCan} className={selectedPlayList.length > 0 ? '': 'inactive'}/>
            {selectedPlayList.length > 0 && <div className="badge">{selectedPlayList.length}</div>}
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

          <div className="slider">
            <input type="range" min={0} max={1} step={0.1}
                   value={setting?.volume || 0}
                   onChange={(e) => {
                     let v = Number(e.target.value);
                     console.log('change volume', v);
                     setSetting({...setting, volume: v});
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
                  setSetting({...setting, muted: newMuted, volume: newVolume})
                  changeMuted(newMuted)
                  changeVolume(newVolume)
                }
            }>
            <Icon icon={setting.muted ? faVolumeMute : faVolumeHigh} className={setting?.muted ? 'blink': ''}/>
          </div>
        </div>
        <div className={`row second`}>
          <Icon icon={faMusic} />
          <div className="title"
               title={setting.playPath ?? ''}
               onClick={() => {setting.playPath && scrollPlayPath(setting.playList ?? [], setting.playPath)}}
          >{getFilename(setting.playPath ?? '')}</div>
        </div>
        <div className={`row third ${(!mediaRef?.paused && setting.playPath) ? 'playing' : ''}`}>
          <div><input type="checkbox" onChange={changeAllChecked}/></div>
          <div className="tm">{formatSeconds(setting.currentTime ?? 0)}</div>
          <div className="slider">
            <input type="range" min={0} max={mediaRef?.duration || 0} step={1}
                   value={setting.currentTime ?? 0}
                   onChange={(e) => {
                     const tm = Number(e.target.value);
                     console.log('change currentTime', tm);
                     setSetting({...setting, currentTime: tm});
                     changeCurrentTime(tm);
                   }}/>
          </div>
          <div className="tm">{formatSeconds(mediaRef?.duration ?? 0)}</div>
        </div>
      </div>
      <div className="play-list-con drop-list"
           onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
      >
        <List className="play-list"
              listRef={listRef}
              rowHeight={22}
              rowCount={setting.playList?.length ?? 0}
              rowComponent={MusicPlayListRowView} rowProps={{ playList: setting.playList ?? []}}
        />
      </div>
    </div>
  )
}



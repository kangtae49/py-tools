import "./MusicPlayerView.css"
import React, {type ChangeEvent, useCallback, useEffect, useRef} from "react";
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
import {type MusicPlayerSetting, useMusicPlayListStore} from "./musicPlayListStore.ts";
import {useSelectedMusicPlayListStore} from "./selectedMusicPlayListStore.ts";
import {useAudioStore} from "../mediaStore.ts";
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
  const initialized = useRef(false);
  const ready = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI>(null);
  const {
    playList, setPlayList, appendPlayList, removePlayList, shufflePlayList, natsortPlayList,
    playPath, setPlayPath,
    getPrevPlayPath, getNextPlayPath,
    setPlayListRef,
    scrollPlayPath,
  } = useMusicPlayListStore();
  const {
    selectedPlayList, setSelectedPlayList, removeSelectedPlayList, appendSelectedPlayList,
    selectionBegin, setSelectionBegin,
  } = useSelectedMusicPlayListStore();
  const {
    play, togglePlay,
    paused, pause,
    volume, changeVolume,
    duration, currentTime, changeCurrentTime,
    muted, changeMuted,
    repeat, toggleRepeat,
    shuffle, toggleShuffle,
    ended, setEnded,
    setting, setSetting,
    filter,
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
    const newPlayList = appendPlayList(playList, files);
    const shuffledPlayList = shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);
    setPlayList(shuffledPlayList)
    let newPlayPath = playPath;
    if (playPath == null && shuffledPlayList.length > 0) {
      newPlayPath = shuffledPlayList[0];
      setPlayPath(newPlayPath);
      setSelectionBegin(newPlayPath)
    }
    const newSetting: MusicPlayerSetting = {...setting, playPath: newPlayPath || undefined, playList: shuffledPlayList}
    console.log('setSetting readFiles')
    setSetting(newSetting)
  }, [playList])


  const openDialogSaveAsJson = async () => {
    commands.dialogOpen({
      dialog_type: "SAVE",
      allow_multiple: true,
      file_types: [`Save Audio Book (${["*.json"].join(";")})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if (files === null) { return }
        const content = JSON.stringify(playList, null, 2);
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
    if (selectedPlayList.length == 0) { return }

    const beginPos = playList.indexOf(selectionBegin ||'');

    const newPlayList = removePlayList(playList, selectedPlayList);
    removeSelectedPlayList(selectedPlayList);
    setPlayList(newPlayList)
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
  }

  const clickTogglePlay = async () => {
    togglePlay().then();
  }

  const playPrev = () => {
    const newPlayPath = getPrevPlayPath(playPath);
    if (newPlayPath == null) return
    if (setting) {
      console.log('setSetting playPrev')
      setSetting({...setting, currentTime: 0, playPath: newPlayPath})
    }
    setPlayPath(newPlayPath);
  }

  const playNext = () => {
    const newPlayPath = getNextPlayPath(playPath);
    if (newPlayPath == null) return
    if (setting) {
      console.log('setSetting playNext')
      setSetting({...setting, currentTime: 0, playPath: newPlayPath})
    }
    setPlayPath(newPlayPath);
  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.getSelection()?.removeAllRanges();
    if (playList.length == 0) return;

    if (e.ctrlKey && e.key === 'a') {
      setSelectedPlayList(playList);
    } else if (e.key === "Delete") {
      clickRemovePlayList();
    } else if (e.key === "ArrowLeft") {
      const newPlayPath = getPrevPlayPath(playPath)
      if (newPlayPath == null) return
      if (setting !== null) {
        console.log('setSetting ArrowLeft')
        setSetting({...setting, currentTime: 0, playPath: newPlayPath})
      }
      setPlayPath(newPlayPath)
      scrollPlayPath(newPlayPath)
    } else if (e.key === "ArrowRight") {
      const newPlayPath = getNextPlayPath(playPath)
      if (newPlayPath == null) return
      if (setting !== null) {
        console.log('setSetting ArrowRight')
        setSetting({...setting, currentTime: 0, playPath: newPlayPath})
      }
      setPlayPath(newPlayPath)
      scrollPlayPath(newPlayPath)
    } else if (e.key === "Enter") {
      if (selectedPlayList.length == 1) {

        if (setting !== null) {
          console.log('setSetting Enter')
          setSetting({...setting, paused: false, playPath: selectedPlayList[0]})
        }
        setPlayPath(selectedPlayList[0]);
      }
    } else if (e.key === "ArrowUp") {
      if (selectionBegin == null) {
        setSelectionBegin(playList[0])
        scrollPlayPath(playList[0])
        return;
      }
      let newSelection = getPrevPlayPath(selectionBegin)
      if (newSelection === null) {
        newSelection = playList[0]
      }
      setSelectionBegin(newSelection)
      scrollPlayPath(newSelection)
    } else if (e.key === "ArrowDown") {
      if (selectionBegin == null) {
        setSelectionBegin(playList[0])
        scrollPlayPath(playList[0])
        return;
      }
      let newSelection = getNextPlayPath(selectionBegin)
      if (newSelection === null) {
        newSelection = playList[0]
      }
      setSelectionBegin(newSelection)
      scrollPlayPath(newSelection)
    } else if (e.key === " ") {
      if (selectionBegin == null) {
        setSelectionBegin(playList[0])
        scrollPlayPath(playList[0])
        return;
      }
      const pos = selectedPlayList.indexOf(selectionBegin);
      if (pos >= 0) {
        removeSelectedPlayList([selectionBegin])
      } else {
        appendSelectedPlayList([selectionBegin])
      }
    }
  }
  const changeAllChecked = (e: ChangeEvent<HTMLInputElement>) => {
    let newPlayList: string[] = []
    if (e.target.checked) {
      newPlayList = [...playList]
    }
    setSelectedPlayList(newPlayList)
  }

  useEffect(() => {
    const shuffledPlayList = shuffle ? shufflePlayList(playList) : natsortPlayList(playList);
    setPlayList(shuffledPlayList)
  }, [shuffle])

  useEffect(() => {
    if (ended) {
      setEnded(false);
      if (playList.length == 0) {
        return;
      }
      if (repeat === 'repeat_all') {
        let nextPlay = playList[0];
        if (playPath !== null) {
          let idx = playList.indexOf(playPath);
          let shuffledPlayList = playList;
          if (shuffle && idx === playList.length -1) {
            shuffledPlayList = shufflePlayList(playList);
          }

          if (idx < 0) {
            idx = 0;
          } else {
            idx++;
          }
          if (idx > shuffledPlayList.length - 1) {
            idx = 0;
          }
          nextPlay = shuffledPlayList[idx]
        }
        if (setting){
          console.log('setSetting useEffect[ended] repeat_all')
          setSetting({...setting, currentTime: 0, playPath: nextPlay})
        }
        setPlayPath(nextPlay);
      } else if (repeat === 'repeat_one') {
        console.log('setSetting useEffect[ended] repeat_one')
        if (playPath) {
          setSetting({...setting, playPath: playPath, currentTime: 0})
          if(!setting?.paused) {
            play()?.then();
          }
        }
      } else if (repeat === 'repeat_none') {
        pause();
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
    if (!ready.current) return;
    console.log('playList ready', playList, ready.current);
    setSetting({...setting, playList: playList})
  }, [ready.current])

  useEffect(() => {
    if (listRef?.current !== null) {
      setPlayListRef(listRef.current);
    }
  }, [listRef?.current])


  const onMount = async () => {

    const result = await commands.appReadFile(MUSIC_PLAYER_SETTING);
    let setting: MusicPlayerSetting | null;
    if(result.status === 'ok') {
      setting = JSON.parse(result.data);
    } else {
      setting = {}
    }
    console.log('setting', setting);
    const newPlayList = setting?.playList ?? []
    const shuffledPlayList = shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);

    const newPlayPath = setting?.playPath ?? shuffledPlayList[0];
    const newSetting = {...setting, playPath: newPlayPath}
    console.log('onMount setSetting')
    setSetting(newSetting)
    setPlayPath(newPlayPath);
    setSelectionBegin(newPlayPath)
    setPlayList(shuffledPlayList)

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
    console.log('setSetting onDropPlayPath')
    setPlayPath(file);
    const newPlayList = appendPlayList(playList, [file]);
    setSetting({...setting, playPath: file, paused: false, playList: newPlayList})
    setPlayList(newPlayList);
    appendSelectedPlayList([file]);
  }, [playList]);

  const onDropPlayList = useCallback((files: string[]) => {
    const addPlayList = files.filter((file) => playList.indexOf(file) < 0);
    const newPlayList = appendPlayList(playList, addPlayList);
    setPlayList(newPlayList)
    appendSelectedPlayList(addPlayList);
    console.log('setSetting onDropPlayList')
    setSetting({...setting, playList: newPlayList})
  }, [playList]);

  useEffect(() => {
    changeMuted(volume == 0);
  }, [volume])

  useEffect(() => {
    if (playPath === null) return;
    fetch(srcLocal(playPath), {method: "HEAD"})
      .then( (res) => {
        if(!res.ok) {
          toast.error( `Fail ${playPath}`);
          console.log('fetch error', res.status);
          const newPlayPath = getNextPlayPath(playPath)
          if (newPlayPath == null) return
          if (setting !== null) {
            console.log('setSetting ArrowRight')
            setSetting({...setting, currentTime: 0, playPath: newPlayPath})
          }
          setPlayPath(newPlayPath)
          scrollPlayPath(newPlayPath)
        }
      })
    ;
  }, [playPath]);

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
      // setDropFiles(fullpathFiles)
    }
    dropRef?.addEventListener("drop-files", onDropFullPathHandler as EventListener)
    return () => {
      console.log('remove onDropTopHandler', dropRef);
      dropRef?.removeEventListener("drop-files", onDropFullPathHandler as EventListener)
    }
  }, [dropRef])

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      containerRef.current?.focus();
      onMount().then(() => {
        ready.current = true;
      });
    }

    return () => {
      if(ready.current) {
        onUnMount().then()
      }
    }
  }, [])

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
              <Icon icon={faShuffle} className={shuffle ? '': 'inactive'}/>
            </div>
            <div className="icon" onClick={() => playPrev()}>
              <Icon icon={faBackwardStep}/>
            </div>
            <div className="icon middle"
                 onClick={() => clickTogglePlay()}
            >
              <Icon icon={paused ? faCirclePlay : faCirclePause } className={paused ? 'blink': ''}/>
            </div>
            <div className="icon" onClick={() => playNext()}>
              <Icon icon={faForwardStep}/>
            </div>
            {repeat === 'repeat_all' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat All"><Icon icon={faArrowsSpin}/></div>}
            {repeat === 'repeat_one' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat One"><Icon icon={faRotateRight}/></div>}
            {repeat === 'repeat_none' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat Off"><Icon icon={faMinus}/></div>}
          </div>

          <div className="slider">
            <input type="range" min={-0.1} max={1} step={0.1} value={volume}
                   onChange={(e) => {
                     let v = Number(e.target.value);
                     setTimeout(()=>changeVolume(v), 0);
                   }}/>
          </div>
          <div className="icon" onClick={() => changeMuted(!muted)}>
            <Icon icon={muted ? faVolumeMute : faVolumeHigh} className={muted ? 'blink': ''}/>
          </div>
        </div>
        <div className={`row second`}>
          <Icon icon={faMusic} />
          <div className="title"
               title={playPath ?? ''}
               onClick={() => {playPath && scrollPlayPath(playPath)}}
          >{getFilename(playPath ?? '')}</div>
        </div>
        <div className={`row third ${(!paused && playPath) ? 'playing' : ''}`}>
          <div><input type="checkbox" onChange={changeAllChecked}/></div>
          <div className="tm">{formatSeconds(currentTime)}</div>
          <div className="slider">
            <input type="range" min={-1} max={duration || 0} step={1}
                   value={currentTime}
                   onChange={(e) => {
                     console.log('change currentTime', e.target.value);
                     const tm = Number(e.target.value);
                     changeCurrentTime(tm);
                   }}/>
          </div>
          <div className="tm">{formatSeconds(duration)}</div>
        </div>
      </div>
      <div className="play-list-con drop-list"
           onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
      >

        <List className="play-list"
              listRef={listRef}
              rowHeight={22}
              rowCount={playList.length}
              rowComponent={MusicPlayListRowView} rowProps={{playList}}
        />
      </div>
    </div>
  )
}


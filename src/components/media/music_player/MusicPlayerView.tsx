import "./MusicPlayerView.css"
import React, {type ChangeEvent, useEffect, useRef, useState} from "react";
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
import {useMusicPlayListStore, type MusicPlayerSetting} from "./musicPlayListStore.ts";
import {useSelectedMusicPlayListStore} from "./selectedMusicPlayListStore.ts";
import {useAudioStore} from "../mediaStore.ts";
import {formatSeconds, getFilename} from "@/components/utils.ts";
import {commands} from "@/bindings.ts"
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {DropFile} from "@/types/models";

const MUSIC_PLAYER_LATEST_PLAYLIST = 'music-player.playlist.latest.json'
const MUSIC_PLAYER_SETTING = 'music-player.setting.json'

export default function MusicPlayerView() {
  const [ready, setReady] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ListImperativeAPI>(null);
  const {
    playList, appendPlayList, removePlayList, shufflePlayList, natsortPlayList,
    playPath, setPlayPath,
    getPrevPlayPath, getNextPlayPath,
    setPlayListRef,
    scrollPlayPath,
  } = useMusicPlayListStore();
  const {
    selectedPlayList, setSelectedPlayList,
    selectionBegin, setSelectionBegin,
  } = useSelectedMusicPlayListStore();
  const {
    paused, pause, togglePlay,
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
    setDropRef
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
        appendPlayList(files);
        let shuffledPlayList: string[];
        if (shuffle) {
          shuffledPlayList = shufflePlayList()
        } else {
          shuffledPlayList = natsortPlayList()
        }

        setSelectedPlayList([])
        setSelectionBegin(null)
        if (playPath == null) {
          setPlayPath(shuffledPlayList[0]);
        }
      }
    })
  }

  const loadJson = async (jsonStr: string): Promise<string []> => {
    const newList: string [] = JSON.parse(jsonStr);
    appendPlayList(newList);
    let shuffledPlayList: string[];
    if (shuffle) {
      shuffledPlayList = shufflePlayList()
    } else {
      shuffledPlayList = natsortPlayList()
    }
    commands.appReadFile(MUSIC_PLAYER_SETTING).then((result) => {
      if (result.status === 'ok'){
        const setting: MusicPlayerSetting = JSON.parse(result.data);
        setPlayPath(setting.playPath ?? null);
        setSetting({...setting})
      } else {
        setSetting({})
        if(shuffledPlayList.length > 0) {
          setPlayPath(shuffledPlayList[0]);
        }
      }
    })

    return shuffledPlayList;
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
            loadJson(result.data).then();
          }
        })
      }
    })
  }


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
    removePlayList(selectedPlayList);
    setSelectedPlayList([])
    setSelectionBegin(null)
  }

  const clickTogglePlay = async () => {
    togglePlay().then();
  }

  const playPrev = () => {
    const newPlayPath = getPrevPlayPath(playPath);
    if (newPlayPath == null) return
    if (setting !== null) {
      setSetting({...setting, currentTime: 0, playPath: newPlayPath})
    }
    setPlayPath(newPlayPath);
  }

  const playNext = () => {
    const newPlayPath = getNextPlayPath(playPath);
    if (newPlayPath == null) return
    if (setting !== null) {
      setSetting({...setting, currentTime: 0, playPath: newPlayPath})
    }
    setPlayPath(newPlayPath);
  }




  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    window.getSelection()?.removeAllRanges();

    if (e.ctrlKey && e.key === 'a') {
      setSelectedPlayList(playList);
    } else if (e.key === "Delete") {
      const nextSelection = getNextPlayPath(selectionBegin);
      clickRemovePlayList();
      if (nextSelection !== null) {
        setSelectionBegin(nextSelection);
        setSelectedPlayList([nextSelection]);
        scrollPlayPath(nextSelection);
      }
    } else if (e.key === "ArrowLeft") {
      const newPlayPath = getPrevPlayPath(playPath)
      if (newPlayPath == null) return
      if (setting !== null) {
        setSetting({...setting, currentTime: 0, playPath: newPlayPath})
      }
      setPlayPath(newPlayPath)
      scrollPlayPath(newPlayPath)
    } else if (e.key === "ArrowRight") {
      const newPlayPath = getNextPlayPath(playPath)
      if (newPlayPath == null) return
      if (setting !== null) {
        setSetting({...setting, currentTime: 0, playPath: newPlayPath})
      }
      setPlayPath(newPlayPath)
      scrollPlayPath(newPlayPath)
    } else if (e.key === "ArrowUp") {
      const newSelection = getPrevPlayPath(selectionBegin)
      if(newSelection !== null) {
        setSelectionBegin(newSelection)
        setSelectedPlayList([newSelection])
        scrollPlayPath(newSelection)
      }
    } else if (e.key === "ArrowDown") {
      const newSelection = getNextPlayPath(selectionBegin)
      if(newSelection !== null) {
        setSelectionBegin(newSelection)
        setSelectedPlayList([newSelection])
        scrollPlayPath(newSelection)
      }
    } else if (e.key === "Enter") {
      if (selectedPlayList.length == 1) {

        if (setting !== null) {
          setSetting({...setting, paused: false, playPath: selectedPlayList[0]})
        }
        setPlayPath(selectedPlayList[0]);
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
    if (shuffle) {
      shufflePlayList()
    } else {
      natsortPlayList()
    }
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
            shuffledPlayList = shufflePlayList();
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
        setPlayPath(nextPlay);
        setSetting({...setting, currentTime: 0, playPath: nextPlay})
      } else if (repeat === 'repeat_one') {
        setSetting({...setting, currentTime: 0})
      } else if (repeat === 'repeat_none') {
        pause();
      }
    }
  }, [ended])

  useEffect(() => {
    if (setting === null) return;
    if (!ready) return;
    console.log('setting', setting);
    commands.appWrite(MUSIC_PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', MUSIC_PLAYER_SETTING);
    })
  }, [ready, setting])

  useEffect(() => {
    if (!ready) return;
    const content = JSON.stringify(playList, null, 2);
    commands.appWrite(MUSIC_PLAYER_LATEST_PLAYLIST, content).then((result) => {
      console.log(result.status, 'appWrite', MUSIC_PLAYER_LATEST_PLAYLIST);
    })
  }, [ready, playList])

  useEffect(() => {
    if (listRef?.current !== null) {
      setPlayListRef(listRef.current);
    }
  }, [listRef?.current])


  useEffect(() => {
    if (containerRef?.current === null) return;
    setDropRef(containerRef)
    const onDropHandler = (e: CustomEvent) => {
      const newDropFiles = e.detail as DropFile[];
      if (newDropFiles !== null) {
        let files = newDropFiles
          .filter((file) => file.type.startsWith("audio/"))
        if (filter.length > 0) {
          files = files.filter((file) => filter.some((ext) => file.pywebview_full_path.endsWith(`.${ext}`)))
        }
        const fullpathFiles = files.map((file) => file.pywebview_full_path);
        if (fullpathFiles.length > 0) {
          appendPlayList(fullpathFiles);
        }
      }
    };
    containerRef?.current?.addEventListener("drop-files", onDropHandler as EventListener);
    return () => containerRef?.current?.removeEventListener("drop-files", onDropHandler as EventListener);
  }, [containerRef?.current])


  useEffect(() => {
    containerRef.current?.focus();
    commands.appReadFile(MUSIC_PLAYER_LATEST_PLAYLIST).then(async (result) => {
      if (result.status === 'ok'){
        await loadJson(result.data);
      } else {
        await loadJson('[]');
      }
    }).finally(() => {
      console.log('ready true');
      setReady(true);
    })
    return () => {
      console.log('unmount ready', ready);
      if (!ready) return;
      commands.appWriteFile(MUSIC_PLAYER_SETTING, JSON.stringify(setting, null, 2)).then((result) => {
        console.log(result.status, 'appWriteFile', MUSIC_PLAYER_SETTING);
      })
      const content = JSON.stringify(playList, null, 2);
      commands.appWriteFile(MUSIC_PLAYER_LATEST_PLAYLIST, content).then((result) => {
        console.log(result.status, 'appWriteFile', MUSIC_PLAYER_LATEST_PLAYLIST);
      })
    }
  }, [])

  return (
    <div className={`widget music-player`}
         ref={containerRef}
         onKeyDown={onKeyDownHandler} tabIndex={0}
    >
      <AudioView />
      <div className="top">
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
              <Icon icon={paused ? faCirclePlay : faCirclePause }/>
            </div>
            <div className="icon" onClick={() => playNext()}>
              <Icon icon={faForwardStep}/>
            </div>
            {repeat === 'repeat_all' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat All"><Icon icon={faArrowsSpin}/></div>}
            {repeat === 'repeat_one' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat One"><Icon icon={faRotateRight}/></div>}
            {repeat === 'repeat_none' && <div className="icon" onClick={() => toggleRepeat()} title="Repeat Off"><Icon icon={faMinus}/></div>}
          </div>

          <div className="slider">
            <input type="range" min={0} max={1} step={0.01} value={volume}
                   onChange={(e) => {
                     const v = Number(e.target.value);
                     changeVolume(v);
                   }}/>
          </div>
          <div className="icon" onClick={() => changeMuted(!muted)}>
            <Icon icon={muted ? faVolumeMute : faVolumeHigh}/>
          </div>
        </div>
        <div className={`row second`}>
          <Icon icon={faMusic} />
          <div className="title" title={playPath ?? ''}>{getFilename(playPath ?? '')}</div>
        </div>
        <div className={`row third ${(!paused && playPath) ? 'playing' : ''}`}>
          <div><input type="checkbox" onChange={changeAllChecked}/></div>
          <div className="tm">{formatSeconds(currentTime)}</div>
          <div className="slider">
            <input type="range" min={0} max={duration || 0} step={0.01} value={currentTime}
                   onChange={(e) => {
                     const tm = Number(e.target.value);
                     changeCurrentTime(tm);
                   }}/>
          </div>
          <div className="tm">{formatSeconds(duration)}</div>
        </div>
      </div>
      <List className="play-list"
            listRef={listRef}
            rowHeight={22}
            rowCount={playList.length}
            rowComponent={MusicPlayListRowView} rowProps={{playList}}

      />
    </div>
  )
}


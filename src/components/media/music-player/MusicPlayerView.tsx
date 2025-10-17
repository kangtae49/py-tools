import "./MusicPlayerView.css"
import React, {useEffect, useState} from "react";
import {formatSeconds, srcLocal} from "@/components/utils.ts";
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {Menu, MenuButton, MenuItem} from "@szhsin/react-menu";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCirclePlay, faCirclePause, faVolumeHigh, faVolumeMute,
  faBackwardStep, faForwardStep,
  faShuffle,
  faArrowsSpin, faRotateRight, faMinus, faMusic,
} from '@fortawesome/free-solid-svg-icons'
import AudioView from "./AudioView.tsx";
import {useAudioStore as useMediaStore} from "../mediaStore.ts";
import {useMusicPlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";
import PlayListView from "@/components/media/play-list/PlayListView.tsx";
import MusicDropListener from "@/components/media/music-player/MusicDropListener.tsx";
import MusicSettingListener from "@/components/media/music-player/MusicSettingListener.tsx";

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
    currentTime, changeCurrentTime, setCurrentTime,
    changeMuted,
    toggleRepeat,
    ended, setEnded,
    setting, setSetting,
    changePlaybackRate,
    ready, setReady,
  } = useMediaStore();
  const {
    shuffle,
    paused, setPaused,
    playPath, setPlayPath,
    playList, setPlayList,
    scrollPlayPath,
    shufflePlayList, toggleShuffle,
    getPrevPlayPath, getNextPlayPath,
    setSelectionBegin,
  } = usePlayListStore();
  const {
    setDropRef,
  } = useReceivedDropFilesStore();


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
    setPlayPath(newPlayPath)
    setCurrentTime(0)
  }

  const playNext = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getNextPlayPath(setting.playPath);
    console.log('setSetting playNext')
    setPlayPath(newPlayPath)
    setCurrentTime(0)
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
    if(setting.paused !== undefined) {
      setPaused(setting.paused)
    }
  }, [setting.paused])

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [currentTime]", currentTime: Math.floor(currentTime)}))
  }, [currentTime])

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", paused}))
  }, [paused]);

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", playList}))
  }, [playList])

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", shuffle}))
  }, [shuffle])

  useEffect(() => {
    const newMuted = setting.volume == 0;
    changeMuted(newMuted);
    setSetting((setting) => ({...setting, caller: "useEffect[setting.volume]", muted: newMuted}))
  }, [setting.volume])

  useEffect(() => {
    if(!ready) return;
    if (playPath === undefined) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playPath]", playPath}))
    console.log('fetch HEAD');
    fetch(srcLocal(playPath), {method: "HEAD"})
      .then( (res) => {
        const {playList} = usePlayListStore.getState()
        if (res.ok) {
        } else {
          toast.error( `Fail ${playPath}`);
          console.log('fetch error', res.status);
          const newPlayPath = getNextPlayPath(playPath)
          setPlayPath(newPlayPath);
          setSelectionBegin(newPlayPath);
          scrollPlayPath(playList, newPlayPath)
        }
      })
    ;
  }, [playPath]);

  useEffect(() => {
    const setting = useMediaStore.getState().setting;
    const {
      shuffle,
      playList,
    } = usePlayListStore.getState();
    if (playList === undefined) return;
    if (mediaRef === null) return;
    if (ended) {
      setEnded(false);
      if (playList.length == 0) {
        return;
      }
      if (setting.repeat === 'repeat_all') {
        if (playList.length == 0) return;
        let idx = playList.indexOf(setting.playPath || '');

        let shuffledPlayList = playList;
        if (idx === playList.length -1) {
          if (shuffle) {
            shuffledPlayList = shufflePlayList(playList);
          }
          idx = 0
        } else {
          idx++;
        }

        const nextPlay = shuffledPlayList[idx]
        console.log('setSetting useEffect[ended] repeat_all')
        setPlayPath(nextPlay);
        setPlayList(shuffledPlayList);
      } else if (setting.repeat === 'repeat_one') {
        console.log('setSetting useEffect[ended] repeat_one')
        if (playPath) {
          setPlayPath(playPath);
          setCurrentTime(0);
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
    console.log('ready', ready)
  }, [ready])

  const onMount = async () => {
    console.log('onMount')
  }

  const onUnMount = async () => {
    console.log('onUnMount', ready)
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
    <div className={`widget music-player`}
         ref={setContainerRef}
         onKeyDown={onKeyDownHandler}
         tabIndex={0}
    >
      <MusicDropListener />
      <MusicSettingListener />
      <div className="audio-player">
        <AudioView />
      </div>
      <div className="top drop-top"
           onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
      >
        <div className={`row time-line ${(!mediaRef?.paused && setting.playPath) ? 'playing' : ''}`}>
          <div className="tm">{formatSeconds(currentTime)}</div>
          <div className="slider">
            <input type="range" min={0} max={mediaRef?.duration || 0} step={1}
                   value={currentTime}
                   onChange={(e) => {
                     const tm = Number(e.target.value);
                     console.log('change currentTime', tm);
                     setCurrentTime(tm);
                     changeCurrentTime(tm);
                   }}/>
          </div>
          <div className="tm">{formatSeconds(mediaRef?.duration ?? 0)}</div>
        </div>

        <div className="row first">
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

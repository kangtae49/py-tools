import "./MusicPlayerView.css"
import React from "react";
import {formatSeconds, srcLocal} from "@/components/utils.ts";
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCirclePlay, faCirclePause,
  faBackwardStep, faForwardStep,
  faShuffle,
  faArrowsSpin, faRotateRight, faMinus, faMusic,
} from '@fortawesome/free-solid-svg-icons'
import AudioView from "./AudioView.tsx";
import {useAudioStore as useMediaStore} from "../useMediaStore.ts";
import {useMusicPlayListStore as usePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";
import MusicDropListener from "./MusicDropListener.tsx";
import MusicSettingListener from "./MusicSettingListener.tsx";
import PlayListView from "@/components/media/play-list/PlayListView.tsx";
import VolumeMenu from "@/components/media/menu/volume-menu/VolumeMenu.tsx";
import SpeedMenu from "@/components/media/menu/speed-menu/SpeedMenu.tsx";
import useOnload from "@/stores/useOnload.ts";
import {useAppStore} from "@/stores/useAppStore.ts";


interface Prop {
  winKey: WinKey
}

export default function MusicPlayerView({winKey: _}: Prop) {
  const {onLoad, onUnload, useReadyEffect} = useOnload()
  onLoad(() => {
    console.log("onLoad")
  });

  onUnload(() => {
  });
  const {toggleFullscreen} = useAppStore()

  const {
    mediaRef,
    setContainerRef,
    changeVolume,
    currentTime, changeCurrentTime, setCurrentTime,
    changeMuted,
    toggleRepeat,
    ended, setEnded,
    setting, setSetting,
    changePlaybackRate,
  } = useMediaStore();
  const {
    shuffle,
    playing, setPlaying,
    playPath, setPlayPath,
    playList, setPlayList,
    scrollPlayPath,
    shufflePlayList, toggleShuffle,
    getPrevPlayPath, getNextPlayPath,
  } = usePlayListStore();
  const {
    setDropRef,
  } = useReceivedDropFilesStore();

  useReadyEffect(() => {
    if(setting.paused !== undefined) {
      setPlaying(!setting.paused)
    }
  }, [setting.paused])

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [currentTime]", currentTime: Math.floor(currentTime)}))
  }, [currentTime])

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", paused: !playing}))
  }, [playing]);

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", playList}))
  }, [playList])

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", shuffle}))
  }, [shuffle])

  useReadyEffect(() => {
    const newMuted = setting.volume == 0;
    changeMuted(newMuted);
    setSetting((setting) => ({...setting, caller: "useEffect[setting.volume]", muted: newMuted}))
  }, [setting.volume])

  useReadyEffect(() => {
    if (playPath === undefined) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playPath]", mediaPath: playPath}))
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
          scrollPlayPath(playList, newPlayPath)
        }
      })
    ;
  }, [playPath]);

  useReadyEffect(() => {
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
        let idx = playList.indexOf(setting.mediaPath || '');

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

  const clickTogglePlay = async () => {
    const newPaused = !setting.paused
    setSetting((setting) => ({...setting, caller: "clickTogglePlay", paused: newPaused}))
  }

  const playPrev = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getPrevPlayPath(setting.mediaPath);
    console.log('setSetting playPrev')
    setPlayPath(newPlayPath)
    setCurrentTime(0)
  }

  const playNext = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getNextPlayPath(setting.mediaPath);
    console.log('setSetting playNext')
    setPlayPath(newPlayPath)
    setCurrentTime(0)
  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.key === "F11") {
      console.log('F11')
      toggleFullscreen()
    }
    const onKeyDownPlayList = usePlayListStore.getState().onKeyDownPlayList
    onKeyDownPlayList(e);

  }

  const toggleMute= (_e: React.MouseEvent ) => {
    const { setting } = useMediaStore.getState()
    const newMuted = !setting.muted;
    let newVolume = setting.volume ?? 0;
    if(!newMuted && setting.volume === 0) {
      newVolume = 0.5;
    }
    setSetting((setting) => ({...setting, caller: "mute click", muted: newMuted, volume: newVolume}))
    changeMuted(newMuted)
    changeVolume(newVolume)
  }

  const onChangeSpeed = (value: string) => {
    const v = Number(value)
    setSetting((setting) => ({...setting, caller: "clickSpeed", playbackRate: v}))
    changePlaybackRate(v);
  }

  const onChangeVolume= (value: string) => {
    let v = Number(value);
    console.log('change volume', v);
    setSetting((setting) => ({...setting, caller: "input range", volume: v}));
    changeVolume(v);
  }

  return (
    <>
      <MusicDropListener />
      <MusicSettingListener />
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
          <div className={`row time-line ${(!mediaRef?.paused && setting.mediaPath) ? 'playing' : ''}`}>
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
            <SpeedMenu
              value={String(setting.playbackRate)}
              list={["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"]}
              label={(value) => `x${value}`}
              defaultValue={"1"}
              onChange={onChangeSpeed} />
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
            <VolumeMenu
              muted={setting.muted} volume={setting.volume}
              toggleMute={toggleMute}
              onChangeVolume={onChangeVolume}
            />
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
    </>
  )
}

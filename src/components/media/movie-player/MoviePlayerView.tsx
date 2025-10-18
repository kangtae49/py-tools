import "./MoviePlayerView.css"
import React, {useEffect, useState} from "react";
import {formatSeconds, srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts"
import toast from "react-hot-toast";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {type ClickEvent} from "@szhsin/react-menu";
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCirclePlay, faCirclePause,
  faBackwardStep, faForwardStep,
  faShuffle,
  faArrowsSpin, faRotateRight, faMinus, faFilm, faExpand,
} from '@fortawesome/free-solid-svg-icons'
import VideoView from "./VideoView.tsx";
import {useVideoStore as useMediaStore} from "../mediaStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import {getSubs} from "@/components/media/media.ts";
import {useMoviePlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";
import PlayListView from "@/components/media/play-list/PlayListView.tsx";
import MovieDropListener from "@/components/media/movie-player/MovieDropListener.tsx";
import MovieSettingListener from "@/components/media/movie-player/MovieSettingListener.tsx";
import VolumeMenu from "@/components/media/menu/volume-menu/VolumeMenu.tsx";
import SpeedMenu from "@/components/media/menu/speed-menu/SpeedMenu.tsx";
import SubtitleMenu from "@/components/media/menu/subtitle-menu/SubtitleMenu.tsx";

export const PLAYER_SETTING = 'movie-player.setting.json'

interface Prop {
  winKey: WinKey
}

export default function MoviePlayerView({winKey: _}: Prop) {
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
    subs, setSubs, changeAllTrackMode,
  } = useMediaStore();
  const {
    shuffle,
    playing, setPlaying,
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

  const clickVideo = (e: React.MouseEvent) => {
    const state = useMediaStore.getState();
    if (!state.fullscreen) {
      const newPaused = !setting.paused;
      setSetting((setting) => ({...setting, caller: "clickVideo", paused: newPaused}))
    }
    console.log('clickVideo', e);
  }

  const onChangeSub = (e: ClickEvent) => {
    const subType = e.value;
    changeAllTrackMode('disabled');
    let newSubType = undefined;
    if (subType !== '') newSubType = subType;
    setSetting((setting) => ({...setting, caller: "clickSubType", subType: newSubType}))
  }

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

  useEffect(() => {
    if(!ready) return;
    if(setting.paused !== undefined) {
      setPlaying(!setting.paused)
    }
  }, [setting.paused])

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [currentTime]", currentTime: Math.floor(currentTime)}))
  }, [currentTime])

  useEffect(() => {
    if(!ready) return;
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", paused: !playing}))
  }, [playing]);

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
    setSetting((setting) => ({...setting, caller: "useEffect [playPath]", mediaPath: playPath}))
    console.log('fetch HEAD');
    fetch(srcLocal(playPath), {method: "HEAD"})
      .then( (res) => {
        const {playList} = usePlayListStore.getState()
        if (res.ok) {
          commands.getSubs(playPath).then((result) => {
            if (result.status === 'ok') {
              const subs = result.data;
              getSubs(subs).then((subs) => {
                console.log('subs', playPath, subs);
                setSubs(subs);
              })
            } else {
              setSubs([])
            }
          })
        } else {
          setSubs([])
          toast.error( `Fail ${playPath}`);
          console.log('fetch error', res.status);
          const newPlayPath = getNextPlayPath(playPath)
          setPlayPath(newPlayPath);
          setSelectionBegin(newPlayPath);
          scrollPlayPath(playList, newPlayPath)
          return;
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
    <div className={`widget movie-player`}
         ref={setContainerRef}
         onKeyDown={onKeyDownHandler}
         tabIndex={0}
    >
      <MovieDropListener/>
      <MovieSettingListener/>
      <SplitPane
        split="horizontal"
        minSize={80}
        primary="second"
        defaultSize={200}
      >
        <AutoSizer>
          {({ height, width }) => (
            <div className="video-view drop-video"
                 style={{width, height}}
                 onClick={clickVideo}
                 onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
            >
              <VideoView />
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
                <SubtitleMenu
                  subs={subs}
                  subType={setting.subType}
                  onChangeSub={onChangeSub}
                />
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
                <SpeedMenu
                  playbackRate={setting.playbackRate}
                  onChangeSpeed={onChangeSpeed} />
                <VolumeMenu
                  muted={setting.muted} volume={setting.volume}
                  toggleMute={toggleMute}
                  onChangeVolume={onChangeVolume}
                />
                <div className="icon" onClick={() => toggleFullscreen()} title="Fullscreen(F11)">
                  <Icon icon={faExpand}/>
                </div>

              </div>
            </div>
            <div className="drop-list"
                 style={{ height: "calc(100% - 85px)", width }}
                 onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
            >
              <PlayListView
                usePlayListStore={usePlayListStore}
                icon={<Icon icon={faFilm} />}
              />
            </div>
          </div>
        )}
        </AutoSizer>
      </SplitPane>
    </div>
  )
}

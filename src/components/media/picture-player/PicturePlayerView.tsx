import "./PicturePlayerView.css"
import React, {Activity, useEffect} from "react";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import PlayListView from "@/components/media/play-list/PlayListView.tsx";
import {
  usePicturePlayListStore as usePlayListStore
} from "@/components/media/play-list/usePlayListStore.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faBackwardStep,
  faCirclePause, faCirclePlay, faExpand,
  faForwardStep,
  faImage,
  faShuffle,
} from "@fortawesome/free-solid-svg-icons";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";

import {
  usePictureStore as useMediaStore,
} from "./usePictureStore.ts";
import PictureGridView, {
} from "@/components/media/picture-grid/PictureGridView.tsx";
import PictureSettingListener from "./PictureSettingListener.tsx";
import SpeedMenu from "@/components/media/menu/speed-menu/SpeedMenu.tsx";
import {srcLocal} from "@/components/utils.ts";
import toast from "react-hot-toast";
import ImageView from "./ImageView.tsx";
import useOnload from "@/stores/useOnload.ts";
import {useAppStore} from "@/stores/useAppStore.ts";
import SwiperView from "@/components/media/picture-player/SwiperView.tsx";
import RepeatMenu from "@/components/media/menu/repeat-menu/RepeatMenu.tsx";
import type {RepeatType} from "@/components/media/useMediaStore.ts";


interface Prop {
  winKey: WinKey
}

export default function PicturePlayerView({winKey: _}: Prop) {
  const {onLoad, useReadyEffect} = useOnload()
  const {toggleFullscreen} = useAppStore()
  const {
    setMediaRef,
    setContainerRef,
    toggleShuffle,
    setting, setSetting,
    viewType, setViewType,
    scrollGrid,
  } = useMediaStore();

  const {
    setShuffle,
    playPath, setPlayPath,
    playList,
    setPlaying,
    getPrevPlayPath, getNextPlayPath,
    scrollPlayPath,
  } = usePlayListStore();

  const {
    setDropRef,
  } = useReceivedDropFilesStore();

  onLoad(() => {
    const {setting, viewType} = useMediaStore.getState()
    console.log('onLoad', setting.paused, viewType)
    if (!setting.paused) {
      setViewType('swiper')
    }
  })



  useEffect(() => {
    console.log('useEffect [viewType]', viewType)
    if (viewType === 'grid') {
      scrollGrid(playList, playPath);
    }
  }, [viewType]);

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", playList}))
  }, [playList])

  useReadyEffect(() => {
    setShuffle(setting.shuffle)
  }, [setting.shuffle])

  useReadyEffect(() => {
    setPlayPath(setting.mediaPath)
  }, [setting.mediaPath])

  useEffect(() => {
    const {setting} = useMediaStore.getState()
    if (!setting.paused) {
      setViewType('swiper')
    }
    setPlaying(!setting.paused)
  }, [setting.paused])

  useReadyEffect(() => {
    if (playPath === undefined) return;
    setSetting((setting) => ({...setting, mediaPath: playPath}))
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


  const clickTogglePlay = async () => {
    const newPaused = !setting.paused
    setSetting((setting) => ({...setting, caller: "clickTogglePlay", paused: newPaused}))
    if (!newPaused) {
      setViewType('swiper')
    } else {
      setViewType('single')
    }
  }

  const playPrev = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getPrevPlayPath(setting.mediaPath);
    console.log('setSetting playPrev', newPlayPath)
    setPlayPath(newPlayPath)
    scrollGrid(playList, newPlayPath)
  }

  const playNext = () => {
    const setting = useMediaStore.getState().setting;
    const newPlayPath = getNextPlayPath(setting.mediaPath);
    console.log('setSetting playNext', newPlayPath)
    setPlayPath(newPlayPath)
    scrollGrid(playList, newPlayPath)

  }

  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const onKeyDownPlayList = usePlayListStore.getState().onKeyDownPlayList
    onKeyDownPlayList(e);
  }


  const onChangeSpeed = (value: string) => {
    const v = Number(value)
    setSetting((setting) => ({...setting, caller: "clickSpeed", playbackRate: v}))
  }

  const onChangeRepeat = (value: RepeatType) => {
    setSetting((setting) => ({...setting, caller: "onChangeRepeat", repeat: value}));
  }

  const onClickTitle = (playPath: string | undefined) => {
    if (playPath === undefined) return;
    const {playList} = usePlayListStore.getState()
    scrollGrid(playList, playPath);
  }

  return (
    <>
      <PictureSettingListener />
      <div className={`widget picture-player`}
           ref={setContainerRef}
           onKeyDown={onKeyDownHandler}
           // onFocus={onFocus}
           tabIndex={0}
      >
        <SplitPane
          split="horizontal"
          // minSize={80} primary="first"
          minSize={0} primary="second"
          defaultSize={200}
        >
          <div className="image-view drop-image fullscreen"
               tabIndex={0}
               // onFocus={() => onFocusImageview()}
               ref={setMediaRef}
          >
          <AutoSizer>
            {({height, width}) => (
              <>
                <Activity mode={viewType === "grid" ? "visible": "hidden"}>
                  <PictureGridView
                    usePlayListStore={usePlayListStore}
                    icon={<Icon icon={faImage} />}
                    width={width}
                    height={height}
                  />
                </Activity>
                <Activity mode={viewType === "single" ? "visible": "hidden"}>
                  <ImageView
                    width={width}
                    height={height}
                  />
                </Activity>
                <Activity mode={viewType === "swiper" ? "visible": "hidden"}>
                  <SwiperView
                    usePlayListStore={usePlayListStore}
                    icon={<Icon icon={faImage} />}
                    width={width}
                    height={height}
                  />
                </Activity>
              </>
            )}
          </AutoSizer>
          </div>
          <AutoSizer>
            {({ height, width }) => (
              <div className="controller" style={{width, height}}>
                <div className="top drop-top"
                     onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
                >
                  <div className={`row time-line ${(!setting.paused && setting.mediaPath) ? 'playing' : ''}`}>
                  </div>
                  <div className="row first">
                    <SpeedMenu
                      value={String(setting.playbackRate)}
                      list={["0.5", "1", "1.5", "2", "2.5", "3", "5", "10"]}
                      label={(value) => `${value}s`}
                      defaultValue={"1"}
                      onChange={onChangeSpeed} />
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
                      <RepeatMenu
                        value={setting.repeat}
                        defaultValue={'repeat_all'}
                        list={['repeat_all', 'repeat_none']}
                        label={(v) => ({
                            'repeat_all': 'Repeat All',
                            'repeat_one': 'Repeat One',
                            'repeat_none': 'Repeat Off'
                          }[v]
                        )}
                        onChange={onChangeRepeat}
                      />
                    </div>
                    <div className="icon" onClick={() => toggleFullscreen()} title="Fullscreen(F11)">
                      <Icon icon={faExpand}/>
                    </div>

                  </div>
                </div>
                <div className="drop-list"
                     style={{ height: "calc(100% - 60px)", width }}
                     onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
                >
                  <PlayListView
                    usePlayListStore={usePlayListStore}
                    icon={<Icon icon={faImage} />}
                    onClickTitle={onClickTitle}
                  />
                </div>
              </div>
            )}
          </AutoSizer>
        </SplitPane>
      </div>
    </>
  )
}
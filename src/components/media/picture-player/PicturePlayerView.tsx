import "./PicturePlayerView.css"
import React, {Activity} from "react";
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import PlayListView from "@/components/media/play-list/PlayListView.tsx";
import {
  usePicturePlayListStore as usePlayListStore
} from "@/components/media/play-list/usePlayListStore.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faArrowsSpin,
  faBackwardStep,
  faCirclePause, faCirclePlay, faExpand,
  faForwardStep,
  faImage, faMinus, faRotateRight,
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


interface Prop {
  winKey: WinKey
}

export default function PicturePlayerView({winKey: _}: Prop) {
  const {onLoad, useReadyEffect} = useOnload()
  const {toggleFullscreen} = useAppStore()
  const {
    setMediaRef,
    // setting,
    containerRef, setContainerRef,
    toggleRepeat,
    toggleShuffle,
    setting, setSetting,
    viewType,
    scrollGrid,
  } = useMediaStore();

  const {
    setShuffle,
    playing, setPlaying,
    playPath, setPlayPath,
    playList,
    getPrevPlayPath, getNextPlayPath,
    setSelectionBegin, scrollPlayPath,
  } = usePlayListStore();

  const {
    setDropRef,
  } = useReceivedDropFilesStore();

  onLoad(() => {
    console.log('onLoad')
    containerRef?.focus();
  })

  useReadyEffect(() => {
    setPlaying(!setting.paused)
  }, [setting.paused])

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [playing]", paused: !playing}))
  }, [playing]);

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, caller: "useEffect [playList]", playList}))
  }, [playList])

  useReadyEffect(() => {
    setShuffle(setting.shuffle)
  }, [setting.shuffle])

  useReadyEffect(() => {
    setPlayPath(setting.mediaPath)
  }, [setting.mediaPath])

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
          setSelectionBegin(newPlayPath);
          scrollPlayPath(playList, newPlayPath)
        }
      })
    ;
  }, [playPath]);


  const clickTogglePlay = async () => {
    const newPaused = !setting.paused
    setSetting((setting) => ({...setting, caller: "clickTogglePlay", paused: newPaused}))
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


  // const onChangeSliderWidth = (value: string) => {
  //   const {setting} = usePictureStore.getState()
  //   let val = Number(value)
  //   val = Math.max(val, SLIDER_MIN)
  //   console.log('onChangeSliderWidth', setting.sliderCheck)
  //   if (setting.sliderCheck) {
  //     setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
  //   } else {
  //     setSetting((setting) => ({...setting, sliderWidth: val}))
  //   }
  // }
  // const onChangeSliderHeight = (value: string) => {
  //   const {setting} = usePictureStore.getState()
  //   let val = Number(value)
  //   val = Math.max(val, SLIDER_MIN)
  //   console.log('onChange checked', setting.sliderCheck)
  //   if (setting.sliderCheck) {
  //     setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
  //   } else {
  //     setSetting((setting) => ({...setting, sliderHeight: val}))
  //   }
  // }

  // const onFocus = () => {
  //   console.log('onFocus!!!!')
  //
  //   const {setting, gridWidth, gridHeight} = usePictureStore.getState()
  //   const maxWidth = gridWidth - SLIDER_SIZE - SCROLL_SIZE;
  //   const maxHeight = gridHeight - SLIDER_SIZE;
  //   if (setting.sliderWidth > maxWidth) {
  //     onChangeSliderWidth(maxWidth.toString())
  //   }
  //   if (setting.sliderHeight > maxHeight) {
  //     onChangeSliderHeight(maxHeight.toString())
  //   }
  // }

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
                {/*<PictureListView*/}
                {/*  usePlayListStore={usePlayListStore}*/}
                {/*  icon={<Icon icon={faImage} />}*/}
                {/*  width={width}*/}
                {/*  height={height}*/}
                {/*/>*/}
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
                      list={["1", "2", "3"]}
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
                </div>
                <div className="drop-list"
                     style={{ height: "calc(100% - 50px)", width }}
                     onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
                >
                  <PlayListView
                    usePlayListStore={usePlayListStore}
                    icon={<Icon icon={faImage} />}
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
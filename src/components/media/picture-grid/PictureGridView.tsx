import "./PictureGridView.css"
import React, {useEffect, useState} from "react";
import {Grid} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type PlayListStore,
} from "@/components/media/play-list/playListStore.ts";
import PictureGridCellView from "@/components/media/picture-grid/PictureGridCellView.tsx";
import {usePictureStore} from "@/components/media/picture-player/pictureStore.ts";

export type Direction = "row" | "column";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  icon?: React.ReactElement
  width: number
  height: number
}

function PictureGridView({
  usePlayListStore,
  icon: _,
  width,
  height,
}: Prop) {
  const [isInitialized, setIsInitialized] = useState(false);
  const {setting, setSetting} = usePictureStore();
  const {playList} = usePlayListStore()

  const SLIDER_SIZE = 25;
  const SCROLL_SIZE = 15;
  const SLIDER_STEP = 32;

  const gridWidth = width - SLIDER_SIZE - SCROLL_SIZE;
  const gridHeight = height - SLIDER_SIZE;

  useEffect(() => {
    let active = false;
    const controller = new AbortController();
    onMount(controller.signal, () => {active = true;})

    return () => {
      controller.abort();
      if (active) {
        onUnMount().then()
      }
    }
  }, [])

  const onMount = async (signal: AbortSignal, onComplete: () => void) => {
    console.log('onMount', signal)
    await Promise.resolve();

    if(signal?.aborted) {
      console.log('onMount Aborted')
      return;
    }

    // do something
    onComplete();
    setIsInitialized(true)
    console.log('onMount Completed')
  }

  const onUnMount = async () => {
    console.log('onUnMount')
  }

  const getColumnCount = () => {
    const {setting} = usePictureStore.getState();

    let cnt =  Math.floor(gridWidth / setting.sliderWidth)
    if (cnt <= 0) {
      cnt = 1
    }
    return cnt;
  }
  const getRowCount = () => {
    const {playList} = usePlayListStore.getState();

    let cnt =  Math.ceil(playList.length / getColumnCount())
    if (cnt <= 0 && playList.length > 0) {
      cnt = 1
    }
    return cnt;
  }

  const onChangeSliderCheck = (value: boolean) => {
    // const {setSetting} = usePictureStore.getState()
    console.log('onChangeSliderCheck', value)
    setSetting((setting) => ({...setting, sliderCheck: value}))
  }
  const onChangeSliderWidth = (value: string) => {
    const {setting} = usePictureStore.getState()
    const val = Number(value)
    console.log('onChange checked', setting.sliderCheck)
    if (setting.sliderCheck) {
      setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
    } else {
      setSetting((setting) => ({...setting, sliderWidth: val}))
    }
  }
  const onChangeSliderHeight = (value: string) => {
    const {setting} = usePictureStore.getState()
    const val = Number(value)
    console.log('onChange checked', setting.sliderCheck)
    if (setting.sliderCheck) {
      setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
    } else {
      setSetting((setting) => ({...setting, sliderHeight: val}))
    }
  }

  const columnCount = getColumnCount();
  const rowCount = getRowCount();
  // console.log('size', width, height, gridWidth, gridHeight, setting.sliderWidth, setting.sliderHeight, getColumnCount(), getRowCount())
  // console.log('checked', setting, setting.sliderCheck)
  if (!isInitialized) return null;
  return (
  <div className="picture-grid" style={{width: width, height: height}}>
    <div className="slider-wrap-w">
      <input type="checkbox"
             checked={setting.sliderCheck}
             onChange={(e) => onChangeSliderCheck(e.target.checked)}/>
      <div className="slider-w">
        <input type="range" min={0} max={gridWidth - SLIDER_SIZE}
               step={SLIDER_STEP}
               value={Math.min(setting.sliderWidth, gridWidth - SLIDER_SIZE)}
               onChange={(e) => onChangeSliderWidth(e.target.value)}
        />
      </div>
    </div>
    <div className="slider-wrap-h">
      <div className="slider-h">
        <input type="range"
               min={0} max={gridHeight - SLIDER_SIZE}
               step={SLIDER_STEP}
               value={Math.min(setting.sliderHeight, gridHeight - SLIDER_SIZE)}
               onChange={(e) => onChangeSliderHeight(e.target.value)}
        />
      </div>
      <Grid className="picture-grid"
            cellComponent={PictureGridCellView}
            cellProps={{
              // usePlayListStore,
              playList: playList,
              columnCount: columnCount,
              // icon: <Icon icon={faImage} />,
              // rowCount: getRowCount(),
            }}
            columnWidth={(_x) => setting.sliderWidth}
            rowHeight={setting.sliderHeight}
            columnCount={columnCount}
            rowCount={rowCount}
            style={{width: width - SLIDER_SIZE, height: height - SLIDER_SIZE}}
      />
      </div>
    </div>

)
}

export default React.memo(PictureGridView);
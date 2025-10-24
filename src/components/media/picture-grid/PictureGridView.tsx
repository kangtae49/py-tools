import "./PictureGridView.css"
import React, {useEffect} from "react";
import {Grid} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type UsePlayListStore,
} from "@/components/media/play-list/usePlayListStore.ts";
import PictureGridCellView from "@/components/media/picture-grid/PictureGridCellView.tsx";
import {usePictureStore} from "@/components/media/picture-player/usePictureStore.ts";
import useOnload from "@/stores/useOnload.ts";
// import {commands} from "@/bindings.ts";

export const SCROLL_SIZE = 15;
export const SLIDER_SIZE = 25;
export const SLIDER_STEP = 1;
export const SLIDER_MIN = 64;

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<UsePlayListStore>>
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
  const {onLoad} = useOnload()
  const {
    setGridRef,
    setSliderWidthRef, setSliderHeightRef,
    setting, setSetting,
    columnCount, setColumnCount,
    rowCount, setRowCount,
    scrollGrid,
    gridWidth, setGridWidth,
    gridHeight, setGridHeight,
    resizeSlider,
  } = usePictureStore();
  const {playList} = usePlayListStore();

  onLoad(() => {
    console.log('onLoad')
    const {setting} = usePictureStore.getState()
    const {playList} = usePlayListStore.getState()
    resizeSlider()
    scrollGrid(playList, setting.mediaPath)
  })

  useEffect(() => {
    console.log('useEffect[width, height]', width, height)
    setGridWidth(width)
    setGridHeight(height)
  }, [width, height])


  useEffect(() => {
    console.log('useEffect[gridWidth, gridHeight, playList, setting.sliderWidth, setting.sliderHeight, setting.sliderCheck]', gridWidth, gridHeight)
    const columnCount = getColumnCount();
    const rowCount = getRowCount();
    resizeSlider()

    setColumnCount(columnCount)
    setRowCount(rowCount)
  }, [gridWidth, gridHeight, playList, setting.sliderWidth, setting.sliderHeight, setting.sliderCheck])


  useEffect(() => {
    console.log('useEffect[columnCount, rowCount]')
    resizeSlider()
  }, [columnCount, rowCount])

  useEffect(() => {
    console.log('useEffect[setting.mediaPath, playList]')
    scrollGrid(playList, setting.mediaPath)
  }, [setting.mediaPath, playList])


  const getColumnCount = () => {
    const {setting, gridWidth} = usePictureStore.getState();

    let cnt =  Math.floor((gridWidth - SLIDER_SIZE - SCROLL_SIZE) / setting.sliderWidth)
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
    console.log('onChangeSliderCheck', value)
    setSetting((setting) => ({...setting, sliderCheck: value}))
  }
  const onChangeSliderWidth = (value: string) => {
    const {setting} = usePictureStore.getState()
    let val = Number(value)
    const SLIDER_WIDTH_MAX = width - SLIDER_SIZE - SCROLL_SIZE;
    val = Math.max(val, SLIDER_MIN)
    val = Math.min(val, SLIDER_WIDTH_MAX)
    console.log('onChangeSliderWidth', val)
    if (setting.sliderCheck) {
      setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
    } else {
      setSetting((setting) => ({...setting, sliderWidth: val}))
    }
  }
  const onChangeSliderHeight = (value: string) => {
    const {setting} = usePictureStore.getState()
    let val = Number(value)
    const SLIDER_HEIGHT_MAX = height - SLIDER_SIZE;
    val = Math.max(val, SLIDER_MIN)
    val = Math.min(val, SLIDER_HEIGHT_MAX)
    console.log('onChangeSliderHeight', val)
    if (setting.sliderCheck) {
      setSetting((setting) => ({...setting, sliderWidth: val, sliderHeight: val}))
    } else {
      setSetting((setting) => ({...setting, sliderHeight: val}))
    }
  }

  return (
  <div className="picture-grid"
    style={{width: width, height: height}}

  >
    <div className="slider-wrap-w">
      <div className="check">
        <input type="checkbox"
               checked={setting.sliderCheck}
               onChange={(e) => onChangeSliderCheck(e.target.checked)}/>
      </div>
      <div className="slider-w">
        <input type="range"
               ref={setSliderWidthRef}
               min={0}
               max={width - SLIDER_SIZE - SCROLL_SIZE}
               step={SLIDER_STEP}
               value={Math.max(setting.sliderWidth, SLIDER_MIN)}
               onChange={(e) => onChangeSliderWidth(e.target.value)}
               style={{width: width - SLIDER_SIZE}}
        />
      </div>
    </div>
    <div className="slider-wrap-h">
      <div className="slider-h">
        <input type="range"
               ref={setSliderHeightRef}
               min={0}
               max={height - SLIDER_SIZE}
               step={SLIDER_STEP}
               value={Math.max(setting.sliderHeight, SLIDER_MIN)}
               onChange={(e) => onChangeSliderHeight(e.target.value)}
               style={{height: height - SLIDER_SIZE}}
        />
      </div>
      <Grid
        gridRef={setGridRef}
        cellComponent={PictureGridCellView}
        columnCount={columnCount}
        columnWidth={setting.sliderWidth}
        rowCount={rowCount}
        rowHeight={setting.sliderHeight}
        cellProps={{
          // playList: playList,
          usePlayListStore,
          columnCount: columnCount,
          columnWidth: setting.sliderWidth,
        }}
        style={{height: height - SLIDER_SIZE,}}

      />
      </div>
    </div>
  )
}

export default PictureGridView;
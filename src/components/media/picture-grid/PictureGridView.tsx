import "./PictureGridView.css"
import {Grid} from "react-window";
import React from "react";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type PlayListStore,
} from "@/components/media/play-list/playListStore.ts";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faImage} from "@fortawesome/free-solid-svg-icons";
import PictureGridCellView from "@/components/media/picture-grid/PictureGridCellView.tsx";

export type Direction = "row" | "column";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  icon?: React.ReactElement
}

function PictureGridView({
  usePlayListStore,
  icon: _,
}: Prop) {
  // console.log('ImageListView', columnIndex, rowIndex)
  const {
    playList,
  } = usePlayListStore();


  return (
  <div className="picture-grid">
    <div className="slider-wrap-w">
      <input type="checkbox" />
      <div className="slider-w">
        <input type="range" min={0} max={1} step={0.1} />
      </div>
    </div>
    <div className="slider-wrap-h">
      <div className="slider-h">
        <input type="range" min={0} max={1} step={0.1} />
      </div>
        <Grid className="picture-grid"
              cellComponent={PictureGridCellView}
              cellProps={{
                usePlayListStore,
                icon: <Icon icon={faImage} />
              }}
              columnCount={2}
              columnWidth={500}
              rowCount={playList.length}
              rowHeight={500}
        />
      </div>
    </div>


)
}

export default React.memo(PictureGridView);
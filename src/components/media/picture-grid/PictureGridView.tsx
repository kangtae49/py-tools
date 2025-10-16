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

)
}

export default React.memo(PictureGridView);
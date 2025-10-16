import {srcLocal} from "@/components/utils.ts";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import type {PlayListStore} from "@/components/media/play-list/playListStore.ts";
import React from "react";
import type {CellComponentProps} from "react-window";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  icon?: React.ReactElement
}

function PictureGridCellView({
                               columnIndex: _columnIndex,
                               rowIndex,
                               style,
                               usePlayListStore,
                               icon: _,
                             }: CellComponentProps<Prop>) {
  const {playList} = usePlayListStore();

  return (
      <div className="cell" style={style}>
        {/*<img src={srcLocal("C:\\Users\\kkt\\Downloads\\pictures\\20150723_122809.jpg")} alt={`image`} />*/}
        <img src={srcLocal(playList[rowIndex])} alt={`image`} />
      </div>
  )
}

export default PictureGridCellView;

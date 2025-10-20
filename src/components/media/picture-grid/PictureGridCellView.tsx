import {getFilename, srcLocal} from "@/components/utils.ts";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import type {PlayListStore} from "@/components/media/play-list/playListStore.ts";
import type {CellComponentProps} from "react-window";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  columnCount: number
  // icon?: React.ReactElement
  // rowCount: number
}

function PictureGridCellView({
  columnIndex: columnIndex,
  rowIndex,
  style,
  usePlayListStore,
  // icon,
  columnCount,
  // rowCount,
}: CellComponentProps<Prop>) {
  const {playList} = usePlayListStore();
  const idx = rowIndex * columnCount + columnIndex;
  let imgSrc: string | null = null;
  if (idx < playList.length) {
    imgSrc = playList[idx]
  }
  return (
    <div className="cell" style={style}>
      {imgSrc && <img src={srcLocal(imgSrc)}
            loading="lazy"
            alt={getFilename(imgSrc)}
      />}
    </div>
  )
}

export default PictureGridCellView;

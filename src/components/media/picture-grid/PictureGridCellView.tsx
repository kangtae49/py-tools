import {getFilename, srcLocal} from "@/components/utils.ts";
import type {UsePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";
import type {CellComponentProps} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {usePictureStore} from "@/components/media/picture-player/usePictureStore.ts";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<UsePlayListStore>>
  // playList: string[]
  columnCount: number
  columnWidth: number
}

function PictureGridCellView({
  columnIndex: columnIndex,
  rowIndex,
  style,
  // playList,
  usePlayListStore,
  columnCount,
  // rowCount,
}: CellComponentProps<Prop>) {
  const {setSetting, setViewType} = usePictureStore();
  const {playList} = usePlayListStore();

  const onClickCell = async (imgSrc: string | null) => {
    if (imgSrc) {
      setSetting((setting) => ({...setting, mediaPath: imgSrc}));
    }
    setViewType('single')
  }

  const idx = rowIndex * columnCount + columnIndex;
  let imgSrc: string | null = null;
  if (idx < playList.length) {
    imgSrc = playList[idx]
  }

  return (
    <div className="cell" style={style} onClick={() => onClickCell(imgSrc)}>
      {imgSrc && <img src={srcLocal(imgSrc)}
            loading="lazy"
            alt={getFilename(imgSrc)}
      />}
    </div>
  )
}

export default PictureGridCellView;

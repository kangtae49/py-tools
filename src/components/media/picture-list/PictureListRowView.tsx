import {getFilename, srcLocal} from "@/components/utils.ts";
import type {UsePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";
import type {RowComponentProps} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import useOnload from "@/stores/useOnload.ts";
import {useState} from "react";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<UsePlayListStore>>
  // playList: string[]
  columnCount: number
  columnWidth: number
}

function PictureListRowView({
  index,
  style,
  // playList,
  usePlayListStore,
  columnCount,
  columnWidth,
}: RowComponentProps<Prop>) {
  const [idx, setIdx] = useState(0);
  const {useReadyEffect} = useOnload()
  const {playList} = usePlayListStore();

  useReadyEffect(() => {
    setIdx(index * columnCount);
  }, [index, columnCount, playList])

  return (
    <div className="row" style={style}>
    {playList.slice(idx, idx+columnCount).map((playPath: string, idxCol) => (
      <div key={idx*columnCount+idxCol} className="cell" style={{width: columnWidth}}>
        <img src={srcLocal(playPath)}
                        loading="lazy"
                        alt={getFilename(playPath)}
        />
      </div>
    ))}
    </div>
  )
}

export default PictureListRowView;

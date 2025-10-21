import {getFilename, srcLocal} from "@/components/utils.ts";
import type {PlayListStore} from "@/components/media/play-list/playListStore.ts";
import type {RowComponentProps} from "react-window";
import {useEffect, useState} from "react";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
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
  const [isInitialized, setIsInitialized] = useState(false);
  const {playList} = usePlayListStore();
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
    await Promise.resolve();

    if(signal?.aborted) {
      return;
    }

    // do something
    onComplete();
    setIsInitialized(true)
  }

  const onUnMount = async () => {
  }

  const idx = index * columnCount;

  if (!isInitialized) return null;
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

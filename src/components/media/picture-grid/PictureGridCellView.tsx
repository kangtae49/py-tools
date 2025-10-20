import {getFilename, srcLocal} from "@/components/utils.ts";
// import type {UseBoundStore} from "zustand";
// import type {StoreApi} from "zustand/vanilla";
// import type {PlayListStore} from "@/components/media/play-list/playListStore.ts";
import type {CellComponentProps} from "react-window";
import {useEffect, useState} from "react";

interface Prop {
  // usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  playList: string[]
  columnCount: number
  // icon?: React.ReactElement
  // rowCount: number
}

function PictureGridCellView({
  columnIndex: columnIndex,
  rowIndex,
  style,
  // usePlayListStore,
  playList,
  // icon,
  columnCount,
  // rowCount,
}: CellComponentProps<Prop>) {
  const [isInitialized, setIsInitialized] = useState(false);

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

  // const {playList} = usePlayListStore();
  const idx = rowIndex * columnCount + columnIndex;
  let imgSrc: string | null = null;
  if (idx < playList.length) {
    imgSrc = playList[idx]
  }

  if (!isInitialized) return null;
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

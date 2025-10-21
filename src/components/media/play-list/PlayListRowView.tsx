import React, {useEffect, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import { type RowComponentProps } from "react-window";
import {getFilename} from "@/components/utils.ts";
import type {StoreApi} from "zustand/vanilla";
import type { UseBoundStore } from "zustand";
import type {PlayListStore} from "@/components/media/play-list/playListStore.ts";




interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  icon?: React.ReactElement,
}

function PlayListRowView({
  index,
  style,
  usePlayListStore,
  icon,
}: RowComponentProps<Prop>) {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    playPath, setPlayPath,
    playing,
    playList, removePlayList, setPlayList,
    selectionBegin, setSelectionBegin,
    checkedPlayList,
    appendCheckedPlayList, removeCheckedPlayList,
  } = usePlayListStore();

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

  const clickPlayPath = (path: string) => {
    console.log('clickPlayPath', path)
    console.log('setSetting clickPlayPath')
    setPlayPath(path)
    setSelectionBegin(path)
  }
  const clickRemovePlayPath = (path: string) => {
    const newPlayList = removePlayList(playList, [path]);
    setPlayList(newPlayList);
    removeCheckedPlayList([path]);
  }

  const changeChecked = (path: string, checked: boolean) => {
    if (checked) {
      appendCheckedPlayList([path]);
    } else {
      removeCheckedPlayList([path]);
    }
  }
  const isPlayPath = playPath === playList[index];
  const isChecked = checkedPlayList.includes(playList[index]);
  const isSelected = playList[index] === selectionBegin;

  if (!isInitialized) return null;
  return (
    <div className={`row ${isSelected ? 'selected': ''} ${isPlayPath ? 'playing' : ''}`} style={style}>
      <div className={`title  ${(playing && isPlayPath) ? 'playing' : ''}`}
           title={playList[index]}
      >
        <div className="no">{index+1}</div>
        <div><input type="checkbox"
                    checked={isChecked}
                    onChange={(e) => changeChecked(playList[index], e.target.checked)}
              />
        </div>

        {isPlayPath && <div>{icon}</div>}
        <div title={playList[index]} onClick={() => clickPlayPath(playList[index])}>
          {getFilename(playList[index])}
        </div>
      </div>
      <div
        onClick={() => clickRemovePlayPath(playList[index])}
      >
        <Icon icon={faCircleXmark} />
      </div>
    </div>
  );
}
export default PlayListRowView;
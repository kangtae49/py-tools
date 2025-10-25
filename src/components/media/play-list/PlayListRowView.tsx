import React from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import { type RowComponentProps } from "react-window";
import {getFilename} from "@/components/utils.ts";
import type {StoreApi} from "zustand/vanilla";
import type { UseBoundStore } from "zustand";
import type {UsePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";


interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<UsePlayListStore>>
  icon?: React.ReactElement,
}

function PlayListRowView({
  index,
  style,
  usePlayListStore,
  icon,
}: RowComponentProps<Prop>) {
  const {
    playPath, setPlayPath,
    playing,
    playList, removePlayList, setPlayList,
    checkedPlayList,
    appendCheckedPlayList, removeCheckedPlayList,
  } = usePlayListStore();


  const clickPlayPath = (path: string) => {
    console.log('clickPlayPath', path)
    setPlayPath(path)
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
  // const isSelected = playList[index] === selectionBegin;

  return (
    <div className={`row ${isPlayPath ? 'playing' : ''}`} style={style}>
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
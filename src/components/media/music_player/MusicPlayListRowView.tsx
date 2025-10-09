import React, {type ChangeEvent} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faMusic,
} from '@fortawesome/free-solid-svg-icons'
import { type RowComponentProps } from "react-window";
import {getFilename} from "@/components/utils.ts";
import {useMusicPlayListStore} from "./musicPlayListStore.ts";
import {useSelectedMusicPlayListStore} from "./selectedMusicPlayListStore.ts";
import {useAudioStore} from "../mediaStore.ts";
function MusicPlayListRowView({
                           index,
                           playList,
                           style
                         }: RowComponentProps<{
  playList: string[];
}>) {
  const {
    paused,
    setting, setSetting,
  } = useAudioStore();
  const {removePlayList, playPath, setPlayPath, setPlayList} = useMusicPlayListStore();
  const {
    selectionBegin,
    selectedPlayList,
    appendSelectedPlayList, removeSelectedPlayList,
  } = useSelectedMusicPlayListStore();



  const clickPlayPath = (path: string) => {
    console.log('clickPlayPath', path)
    console.log('setSetting clickPlayPath')
    setSetting({...setting, playPath: path, currentTime: 0})
    setPlayPath(path);
  }
  const clickRemovePlayPath = (path: string) => {
    const newPlayList = removePlayList(playList, [path]);
    removeSelectedPlayList([path]);
    setPlayList(newPlayList);
    setSetting({...setting, playList: newPlayList})
  }

  const onChangeChecked = (e: ChangeEvent<HTMLInputElement>, path: string) => {
    const checked = e.target.checked;
    if (checked) {
      appendSelectedPlayList([path]);
    } else {
      removeSelectedPlayList([path]);
    }
  }

  const isPlayPath = playPath == playList[index];
  const isChecked = selectedPlayList.includes(playList[index]);
  const isSelected = playList[index] == selectionBegin;

  return (
    <div className={`row ${isSelected ? 'selected': ''}`} style={style}>
      <div className={`title  ${(!paused && isPlayPath) ? 'playing' : ''}`}
           title={playList[index]}
      >
        <div className="no">{index+1}</div>
        <div><input type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onChangeChecked(e, playList[index])}
              />
        </div>

        {isPlayPath && <div><Icon icon={faMusic}/></div>}
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
export default React.memo(MusicPlayListRowView);
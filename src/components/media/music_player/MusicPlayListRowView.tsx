import React, {type ChangeEvent} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faMusic,
} from '@fortawesome/free-solid-svg-icons'
import { type RowComponentProps } from "react-window";
import {getFilename} from "@/components/utils.ts";
import {useAudioStore as useMediaStore} from "../mediaStore.ts";
function MusicPlayListRowView({
                           index,
                           playList,
                           style
                         }: RowComponentProps<{
  playList: string[];
}>) {
  const {
    mediaRef,
    setting, setSetting,
    removePlayList,
    selectionBegin,
    selectedPlayList,
    appendSelectedPlayList, removeSelectedPlayList,
  } = useMediaStore();

  const clickPlayPath = (path: string) => {
    if (setting === null) return;
    console.log('clickPlayPath', path)
    console.log('setSetting clickPlayPath')
    setSetting((setting) => ({...setting, caller: "clickPlayPath", currentTime: 0, playPath: path}))
  }
  const clickRemovePlayPath = (path: string) => {
    if (setting === null) return;
    const newPlayList = removePlayList(playList, [path]);
    removeSelectedPlayList([path]);
    setSetting((setting) => ({...setting, caller: "clickRemovePlayPath", playList: newPlayList}))
  }

  const onChangeChecked = (e: ChangeEvent<HTMLInputElement>, path: string) => {
    const checked = e.target.checked;
    if (checked) {
      appendSelectedPlayList([path]);
    } else {
      removeSelectedPlayList([path]);
    }
  }

  if (setting === null) return;
  const isPlayPath = setting.playPath == playList[index];
  const isChecked = selectedPlayList.includes(playList[index]);
  const isSelected = playList[index] == selectionBegin;
  return (
    <div className={`row ${isSelected ? 'selected': ''} ${isPlayPath ? 'playing' : ''}`} style={style}>
      <div className={`title  ${(!mediaRef?.paused && isPlayPath) ? 'playing' : ''}`}
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
import "./PlayListView.css"
import React from "react";
import PlayListRowView from "./PlayListRowView.tsx";

import {List} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type UsePlayListStore,
} from "@/components/media/play-list/usePlayListStore.ts";
import {getFilename} from "@/components/utils.ts";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faBookMedical, faFloppyDisk, faFolderPlus, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {commands} from "@/bindings.ts";
import toast from "react-hot-toast";
import useOnload from "@/stores/useOnload.ts";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<UsePlayListStore>>
  icon?: React.ReactElement,
  onClickTitle?: (playPath: string | undefined) => void,
}
export default function PlayListView({usePlayListStore, icon, onClickTitle}: Prop) {
  const {useReadyEffect} = useOnload()
  const {
    shuffle,
    playPath,
    playList, setPlayList, appendPlayList,
    playListRef, setPlayListRef,
    checkedPlayList, setCheckedPlayList,
    scrollPlayPath,
    shufflePlayList, natsortPlayList,
    toggleAllChecked,
    filter,
  } = usePlayListStore();

  useReadyEffect(() => {
    console.log('PlayListView', playList, filter[0])
  }, [playList])

  useReadyEffect(() => {
    if (playList.length === 0) return;
    const shuffledPlayList = shuffle ? shufflePlayList(playList) : natsortPlayList(playList);
    setPlayList(shuffledPlayList);
  }, [shuffle])

  useReadyEffect(() => {
    console.log('playListRef', playListRef)
  }, [playListRef])


  const openDialogPlayList = async () => {
    const filter_ext = filter.map((ext)=> `*.${ext}`).join(";") // *.mp3;*.wav;*.ogg;*.m4a;*.opus;*.webm
    commands.dialogOpen({
      dialog_type: "OPEN",
      allow_multiple: true,
      file_types: [`Media files (${filter_ext})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if (files === null) { return }
        readFiles(files);
      }
    })
  }

  const openDialogOpenJson = async () => {
    commands.dialogOpen({
      dialog_type: "OPEN",
      allow_multiple: false,
      file_types: [`OpenMedia Book (${["*.json"].join(";")})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if(files === null) return;
        commands.readFile(files[0]).then(async (result) => {
          if (result.status === 'ok'){
            const files: string [] = JSON.parse(result.data);
            readFiles(files);
          }
        })
      }
    })
  }

  const readFiles = (files: string[]) => {
    console.log('readFiles')
    const {
      playList, shuffle, playPath, setPlayPath
    } = usePlayListStore.getState();
    const newPlayList = appendPlayList(playList, files);
    const shuffledPlayList = shuffle ? shufflePlayList(newPlayList) : natsortPlayList(newPlayList);
    setPlayList(shuffledPlayList);
    if (playPath === undefined && shuffledPlayList.length > 0) {
      setPlayPath(shuffledPlayList[0])
    }
  }


  const openDialogSaveAsJson = async () => {
    const {playList} = usePlayListStore.getState()
    commands.dialogOpen({
      dialog_type: "SAVE",
      allow_multiple: true,
      file_types: [`Save Media Book (${["*.json"].join(";")})`]
    }).then((result) => {
      if(result.status === 'ok') {
        const files = result.data;
        if (files === null) { return }
        const content = JSON.stringify(playList, null, 2);
        commands.writeFile(files[0], content).then(async (result) => {
          if (result.status === 'ok'){
            toast.success("Success save");
          } else {
            toast.error("Fail save");
          }
        })
      }
    })
  }

  const clickTitle = (playPath: string | undefined) => {
    playPath && scrollPlayPath(playList ?? [], playPath)
    if (onClickTitle) {
      onClickTitle(playPath)
    }
  }

  return (
    <div className="play-list">
      <div className="head">
        <div className="dialog">
          <div><input type="checkbox" onChange={(e) => toggleAllChecked(e.target.checked)}/></div>
          <div className="icon" onClick={openDialogPlayList} title="Open Media Files"><Icon icon={faFolderPlus}/></div>
          <div className="icon" onClick={openDialogOpenJson} title="Open Media Book"><Icon icon={faBookMedical}/></div>
          <div className="icon" onClick={openDialogSaveAsJson} title="Save Media Book"><Icon icon={faFloppyDisk}/></div>
          <div className="icon badge-wrap"
               onClick={() => {
                 setPlayList(playList.filter((path)=> !checkedPlayList.includes(path)))
                 setCheckedPlayList([])
               }}
               title="Delete Selection Files">
            <Icon icon={faTrashCan} className={checkedPlayList.length > 0 ? '': 'inactive'}/>
            {checkedPlayList.length > 0 && <div className="badge">{checkedPlayList.length}</div>}
          </div>
        </div>

        <div className="title"
             title={playPath ?? ''}
             onClick={() => clickTitle(playPath)}
        >{playPath && icon} {getFilename(playPath ?? '')}</div>
      </div>
      <List
            listRef={setPlayListRef}
            rowComponent={PlayListRowView}
            rowCount={playList?.length ?? 0}
            rowHeight={22}
            rowProps={{
              usePlayListStore,
              icon,
            }}
            style={{height: "calc(100% - 32px)"}}
      />
    </div>
  )
}
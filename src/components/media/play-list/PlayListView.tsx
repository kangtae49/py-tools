import "./PlayListView.css"
import PlayListRowView from "./PlayListRowView.tsx";

import {List} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type PlayListStore,
} from "@/components/media/play-list/playListStore.ts";
import React, {useEffect, useState} from "react";
import {getFilename} from "@/components/utils.ts";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faBookMedical, faFloppyDisk, faFolderPlus, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {commands} from "@/bindings.ts";
import toast from "react-hot-toast";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  icon?: React.ReactElement,
}
export default function PlayListView({usePlayListStore, icon}: Prop) {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    shuffle,
    playPath,
    playList, setPlayList, appendPlayList,
    setPlayListRef,
    checkedPlayList, setCheckedPlayList,
    scrollPlayPath,
    shufflePlayList, natsortPlayList,
    toggleAllChecked,
    setSelectionBegin,
    filter,
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

  useEffect(() => {
    console.log('PlayListView', playList, filter[0])
  }, [playList])

  useEffect(() => {
    if (playList.length === 0) return;
    const shuffledPlayList = shuffle ? shufflePlayList(playList) : natsortPlayList(playList);
    setPlayList(shuffledPlayList);
  }, [shuffle])


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
    let newPlayPath = playPath;
    if (shuffledPlayList.length > 0) {
      newPlayPath = shuffledPlayList[0];
      setSelectionBegin(newPlayPath)
    }
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

  if (!isInitialized) return null;
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
             onClick={() => {playPath && scrollPlayPath(playList ?? [], playPath)}}
        >{playPath && icon} {getFilename(playPath ?? '')}</div>
      </div>
      <List
            listRef={setPlayListRef}
            rowHeight={22}
            rowCount={playList?.length ?? 0}
            rowComponent={PlayListRowView}
            rowProps={{
              usePlayListStore,
              icon,
            }}
            style={{height: "calc(100% - 32px)"}}
      />
    </div>
  )
}
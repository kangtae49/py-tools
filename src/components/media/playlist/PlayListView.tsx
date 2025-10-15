import "./PlayListView.css"
import PlayListRowView from "./PlayListRowView.tsx";

import {List} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type PlayListStore,
} from "@/components/media/playlist/playListStore.ts";
import React, {useEffect} from "react";
import {getFilename} from "@/components/utils.ts";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
  icon?: React.ReactElement,
}
export default function PlayListView({usePlayListStore, icon}: Prop) {
  const {
    paused,
    playPath,
    playList,
    setPlayListRef,
    scrollPlayPath,
    toggleAllChecked,
  } = usePlayListStore();

  useEffect(() => {
    console.log('PlayListView', paused, playList, playPath)
  }, [])


  return (
    <div className="play-list">
      <div className="head">
        <div><input type="checkbox" onChange={(e) => toggleAllChecked(e.target.checked)}/></div>
        {playPath && icon}
        <div className="title"
             title={playPath ?? ''}
             onClick={() => {playPath && scrollPlayPath(playList ?? [], playPath)}}
        >{getFilename(playPath ?? '')}</div>
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
            style={{height: "calc(100% - 20px)"}}
      />
    </div>
  )
}
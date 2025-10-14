import PlayListRowView from "./PlayListRowView.tsx";

import {List} from "react-window";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import {
  type PlayListStore,
} from "@/components/media/playlist/playListStore.ts";
import {useEffect} from "react";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<PlayListStore>>
}
export default function PlayListView({usePlayListStore}: Prop) {
  const {
    paused,
    playPath,
    playList,
    setPlayListRef,
  } = usePlayListStore();

  useEffect(() => {
    console.log('PlayListView', paused, playList, playPath)
  }, [])


  return (
    <List
      // className="play-list"
          listRef={setPlayListRef}
          rowHeight={22}
          rowCount={playList?.length ?? 0}
          rowComponent={PlayListRowView}
          rowProps={{
            usePlayListStore,
          }}
    />
  )
}
import {useEffect} from "react";
import type {DropFile} from "@/types/models";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import {useMusicPlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";
import {useAudioStore as useMediaStore} from "@/components/media/mediaStore.ts";

function MusicDropListener() {
  const {
    setDropRef,
    dropRef,
  } = useReceivedDropFilesStore();
  const {
    setSetting,
  } = useMediaStore();

  const {
    setPlayPath,
    setPlayList, appendPlayList,
    appendCheckedPlayList,
  } = usePlayListStore();

  const onDropPlayPath = (file: string) => {
    console.log('setSetting onDropPlayPath')
    const {playList} = usePlayListStore.getState()
    if(playList.length === 0) {
      appendCheckedPlayList([file]);
    }
    const newPlayList = appendPlayList(playList, [file]);
    setPlayList(newPlayList)
    setPlayPath(file)
    setSetting((setting) => ({...setting, caller: "onDropPlayPath", paused: false}))
  };

  const onDropPlayList = (files: string[]) => {
    if(files.length === 0) return;
    const {playList} = usePlayListStore.getState()
    const addPlayList = files.filter((file) => playList.indexOf(file) < 0);
    const newPlayList = appendPlayList(playList, addPlayList);
    setPlayList(newPlayList);
    appendCheckedPlayList(addPlayList);
    console.log('setSetting onDropPlayList')
  }

  useEffect(() => {
    const onDropFullPathHandler = (e: CustomEvent) => {
      setDropRef(null);
      const {filter} = usePlayListStore.getState();
      console.log('onDropFullPathHandler', dropRef);
      const newDropFiles = e.detail as DropFile[];
      const fullpathFiles = newDropFiles
        .filter((file) => filter.some((ext) => file.pywebview_full_path.endsWith(`.${ext}`)))
        .map((file) => file.pywebview_full_path);
      if (fullpathFiles.length == 0) {
        return;
      }
      if (dropRef?.classList.contains('drop-top')){
        console.log('drop-top');
        if (fullpathFiles.length == 1) {
          onDropPlayPath(fullpathFiles[0])
        } else {
          onDropPlayList(fullpathFiles)
        }
      } else if (dropRef?.classList.contains('drop-list')) {
        console.log('drop-list');
        onDropPlayList(fullpathFiles);
      }
    }
    dropRef?.addEventListener("drop-files", onDropFullPathHandler as EventListener)
    return () => {
      console.log('remove onDropTopHandler', dropRef);
      dropRef?.removeEventListener("drop-files", onDropFullPathHandler as EventListener)
    }
  }, [dropRef])
  return null
}

export default MusicDropListener;
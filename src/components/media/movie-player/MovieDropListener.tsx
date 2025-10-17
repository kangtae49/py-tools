import {useEffect} from "react";
import type {DropFile, Sub} from "@/types/models";
import {useReceivedDropFilesStore} from "@/stores/useReceivedDropFilesStore.ts";
import {useMoviePlayListStore as usePlayListStore} from "@/components/media/play-list/playListStore.ts";
import {useVideoStore as useMediaStore} from "@/components/media/mediaStore.ts";
import {getFilename} from "@/components/utils.ts";
import {getSubs} from "@/components/media/media.ts";

function MovieDropListener() {
  const {
    setDropRef,
    dropRef,
  } = useReceivedDropFilesStore();
  const {
    setSetting,
    setSubs,
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
      console.log('onDropFullPathHandler', dropRef);
      const filter_video = usePlayListStore.getState().filter;
      const state = useMediaStore.getState();
      const filter_sub = [
        "ass", "mpl", "json", "smi", "sami", "srt", "ssa", "sub", "tmp", "ttml", "vtt",];

      const newDropFiles = e.detail as DropFile[];

      const videoFiles = newDropFiles.filter((file) => filter_video.some((ext) => file.pywebview_full_path.endsWith(`.${ext}`)));
      const subFiles = newDropFiles.filter((file) => filter_sub.some((ext) => file.pywebview_full_path.endsWith(`.${ext}`)));

      const videoFullpathFiles = videoFiles.map((file) => file.pywebview_full_path);
      const subFullpathFiles = subFiles.map((file) => file.pywebview_full_path);

      if (dropRef?.classList.contains('drop-video') || dropRef?.classList.contains('drop-top')) {
        console.log('drop-top or drop-video');
        if (videoFullpathFiles.length + subFullpathFiles.length === 1) {
          if (videoFullpathFiles.length == 1) {
            onDropPlayPath(videoFullpathFiles[0])
            onDropPlayList(videoFullpathFiles);
          } else {
            if (!state.subs.find((sub) => sub.fullpath === subFullpathFiles[0])) {
              const newSub: Sub = {
                fullpath: subFullpathFiles[0],
                lang: "??",
                priority: 3,
                subtype: getFilename(subFullpathFiles[0]) ?? '',
                src: ''
              }
              getSubs([newSub]).then((addSubs) => {
                if (addSubs.length > 0) {
                  setSubs([...state.subs, addSubs[0]])
                  setSetting((setting) => ({...setting, caller: "onDropFullPathHandler", subType: addSubs[0].subtype}))
                }
              });
            }
          }
        } else if(videoFullpathFiles.length > 1) {
          onDropPlayList(videoFullpathFiles);
        }
      } else if (dropRef?.classList.contains('drop-list')) {
        console.log('drop-list');
        onDropPlayList(videoFullpathFiles);
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

export default MovieDropListener;

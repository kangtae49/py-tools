import {useEffect, useState} from "react";
import {useVideoStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts";
import type {Sub} from "@/types/models";


function VideoView() {
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);
  const [subObjSrcMap, setSubObjSrcMap] = useState<Record<string, string>>({});

  const {
    mediaRef, setMediaRef,
    changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
    setFullscreen,
    subs,
  } = useVideoStore();


  useEffect(() => {
    if (!ready) return;
    loadSrc()
  }, [ready, setting?.playPath])

  useEffect(() => {
    if (!ready) return;
    if(mediaRef === null) return;
    if(setting?.playPath == null) return;

    console.log('ready state', mediaRef?.readyState)

    if (setting.paused !== mediaRef.paused) {
      if (setting.paused) {
        mediaRef.pause();
      } else {
        mediaRef.play().then();
      }
    }
  }, [ready, setting?.paused]);


  const isNullPlaying = () => {
    const state = useVideoStore.getState();
    if (state.mediaRef === null) return true;
    if (state.setting === null) return true;
    if (state.setting.playPath == null) return true;
    if (!state.mediaRef) return true;
    return state.mediaRef.currentSrc === '';
  }

  const isValidSrc = () => {
    const state = useVideoStore.getState();
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(state.setting?.playPath ?? '')).href;
    } else {
      settingSrc = srcLocal(state.setting?.playPath ?? '')
    }
    return !!state.mediaRef?.currentSrc.endsWith(settingSrc);
  }

  const loadSrc = () => {
    clearTracks();

    const state = useVideoStore.getState();
    if(state.setting?.playPath == null) return;
    if (state.mediaRef === null) return;
    console.log('playPath', state.setting.playPath);
    state.mediaRef.src = srcLocal(state.setting.playPath);
    state.mediaRef.load();
  }

  const onloadedMetaData = async () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const state = useVideoStore.getState();

    changeVolume(state.setting!.volume);
    changeCurrentTime(state.setting!.currentTime);
    changePlaybackRate(state.setting!.playbackRate);
    changeMuted(state.setting!.muted ?? false)
    console.log('duration', state.mediaRef!.duration)

    if (state.setting!.paused !== state.mediaRef!.paused) {
      if (state.setting!.paused) {
        state.mediaRef!.pause();
      } else {
        state.mediaRef!.play().then();
      }
    }
  }
  const onloadedData = async () => {
    console.log('onloadedData')
  }

  const onTimeUpdate = () => {
    if (isNullPlaying()) return;

    const state = useVideoStore.getState();
    if (isValidSrc()) {
      state.setSetting({...state.setting, caller: "onTimeUpdate", currentTime: state.mediaRef!.currentTime})
    } else {
      state.setSetting({...state.setting, caller: "onTimeUpdate", currentTime: 0})
    }
  }

  const onEnded = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const state = useVideoStore.getState();

    state.mediaRef!.loop = false;
    setEnded(true);
  }
  const onVolumeChange = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;

    const state = useVideoStore.getState();

    setSetting({...state.setting, caller: "onVolumeChange", volume: state.mediaRef!.volume, muted: state.mediaRef!.muted})
  }
  const onRateChange = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const state = useVideoStore.getState();
    setSetting({...state.setting, caller: "onRateChange", playbackRate: state.mediaRef!.playbackRate})
  }
  const onPlay = () => {}
  const onPause = () => {}
  const onError = () => {}
  const onFullscreenChange = async () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;

    const state = useVideoStore.getState();
    const fullscreen = document.fullscreenElement === state.mediaRef;
    console.log('fullscreenchange', fullscreen);
    await commands.toggleFullscreen();
    setFullscreen(fullscreen)

    if (!fullscreen) {
      if (state.mediaRef!.paused !== state.setting!.paused) {
        if(state.setting!.paused) {
          state.mediaRef!.pause()
        } else {
          state.mediaRef?.play().then()
        }
      }
    }
  }

  useEffect(() => {
    if (mediaRef) {
      // refresh start
      console.log('Video View', mediaRef)
      console.log('Video View add listener')
      mediaRef.addEventListener("loadeddata", onloadedData);
      mediaRef.addEventListener("loadedmetadata", onloadedMetaData);
      mediaRef.addEventListener("timeupdate", onTimeUpdate);
      mediaRef.addEventListener("volumechange", onVolumeChange);
      mediaRef.addEventListener("ratechange", onRateChange);
      mediaRef.addEventListener("play", onPlay);
      mediaRef.addEventListener("pause", onPause);
      mediaRef.addEventListener("ended", onEnded);
      mediaRef.addEventListener("error", onError);
      mediaRef.addEventListener("fullscreenchange", onFullscreenChange)

    }

    return () => {
      removeListener();
    };

  }, [mediaRef])


  const removeListener = () => {
    if (mediaRef) {
      console.log('Video View remove listener')
      mediaRef?.removeEventListener("loadedmetadata", onloadedMetaData);
      mediaRef?.removeEventListener("timeupdate", onTimeUpdate);
      mediaRef?.removeEventListener("volumechange", onVolumeChange);
      mediaRef?.removeEventListener("ratechange", onRateChange);
      mediaRef?.removeEventListener("play", onPlay);
      mediaRef?.removeEventListener("pause", onPause);
      mediaRef?.removeEventListener("ended", onEnded);
      mediaRef?.removeEventListener("error", onError);
      mediaRef?.removeEventListener("fullscreenchange", onFullscreenChange);
    }

  }

  const onMount = () => {
    loadSrc();
  }

  useEffect(() => {
    if(initialized && mediaRef) {
        setReady(true);
        onMount();
    }
  }, [initialized, mediaRef])

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
    }
    return () => {
      removeListener();
    }
  }, []);

  const isDefaultSub = (sub: Sub) => {
    if (subs.length == 0) return false;
    const state = useVideoStore.getState();
    return state.setting?.subType == sub.subtype;
  }

  const getSrcSub = async (sub: Sub) => {
    const result = await commands.readSub(sub.fullpath);
    let vttText = '';
    if (result.status === 'ok') {
      vttText = result.data;
    }
    const blob = new Blob([vttText], { type: "text/vtt" });
    return URL.createObjectURL(blob);
  }

  const clearTracks = () => {
    const mediaRef = useVideoStore.getState().mediaRef;
    if (mediaRef == null) return;

    for (let i = 0; i < mediaRef.textTracks.length; i++) {
      const track = mediaRef.textTracks[i];
      track.mode = "hidden";
    }
  }
  const loadVtt = async () => {

    const newMap: Record<string, string> = {};
    for (const sub of subs) {
      try{
        newMap[sub.fullpath] = await getSrcSub(sub);
      } catch (e) {
        console.error('loadVtt', e);
      }
    }
    setSubObjSrcMap({...newMap});
  }
  useEffect(() => {
    loadVtt().then()
  }, [subs])

  useEffect(() => {
    if (subs.length === 0) return;
    if (setting?.subType == null) return;
    if (mediaRef == null) return;
    const tracks = mediaRef?.textTracks;

    for (const track of tracks) {
      if (track.label === setting?.subType) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    }
  }, [setting?.subType])

  return (

      <video
        ref={setMediaRef}
        controls={false}
        preload="metadata"
        autoPlay={false}
      >
        <source />
        { subs && subs.length === Object.keys(subObjSrcMap).length && subs.map((sub, _index) => (
            <track key={sub.fullpath}
                   label={sub.subtype}
                   kind="subtitles"
                   srcLang={sub.lang}
                   src={subObjSrcMap[sub.fullpath]}
                   default={isDefaultSub(sub)}
            />
        ))}
      </video>
  )
}

export default VideoView
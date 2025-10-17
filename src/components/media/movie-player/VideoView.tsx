import {useEffect, useState} from "react";
import {useVideoStore as useMediaStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts";
import type {Sub} from "@/types/models";


function VideoView() {
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  const {
    mediaRef, setMediaRef,
    containerRef,
    currentTime, setCurrentTime, changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
    setFullscreen,
    subs,
  } = useMediaStore();


  useEffect(() => {
    if (!ready) return;
    loadSrc()
  }, [ready, setting?.playPath])

  useEffect(() => {
    if (!ready) return;
    if(mediaRef === null) return;
    if(setting.playPath == undefined) return;

    console.log('ready state', mediaRef?.readyState, currentTime)

    if (setting.paused !== mediaRef.paused) {
      if (setting.paused) {
        mediaRef.pause();
      } else {
        mediaRef.play().then();
      }
    }
  }, [ready, setting.paused]);


  const isNullPlaying = () => {
    const state = useMediaStore.getState();
    if (state.mediaRef === null) return true;
    if (state.setting.playPath == undefined) return true;
    if (!state.mediaRef) return true;
    return state.mediaRef.currentSrc === '';
  }

  const isValidSrc = () => {
    const state = useMediaStore.getState();
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(state.setting?.playPath ?? '')).href;
    } else {
      settingSrc = srcLocal(state.setting?.playPath ?? '')
    }
    return !!state.mediaRef?.currentSrc.endsWith(settingSrc);
  }

  const loadSrc = () => {
    const state = useMediaStore.getState();
    state.changeAllTrackMode('disabled');
    if(state.setting.playPath == undefined) return;
    if (state.mediaRef === null) return;
    console.log('playPath', state.setting.playPath);
    state.mediaRef.src = srcLocal(state.setting.playPath);
    state.mediaRef.load();
  }

  const onloadedMetaData = async () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const {setting, currentTime, mediaRef} = useMediaStore.getState();

    changeVolume(setting.volume ?? 0.5);
    setCurrentTime(currentTime);
    changeCurrentTime(currentTime)
    changePlaybackRate(setting.playbackRate ?? 1.0);
    changeMuted(setting.muted ?? false)
    console.log('duration', mediaRef!.duration)

    if (setting.paused !== mediaRef!.paused) {
      if (setting.paused) {
        mediaRef!.pause();
      } else {
        mediaRef!.play().then();
      }
    }
  }
  const onloadedData = async () => {
    console.log('onloadedData')
  }

  const onTimeUpdate = () => {
    if (isNullPlaying()) return;

    if (isValidSrc()) {
      console.log('mediaRef!.currentTime', mediaRef!.currentTime)
      setCurrentTime(mediaRef!.currentTime)
    } else {
      console.log('mediaRef!.currentTime', 0)
      setCurrentTime(0)
    }
  }

  const onEnded = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const state = useMediaStore.getState();

    state.mediaRef!.loop = false;
    setEnded(true);
  }
  const onVolumeChange = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;

    setSetting((setting) => ({...setting, caller: "onVolumeChange", volume: mediaRef!.volume, muted: mediaRef!.muted}))
  }
  const onRateChange = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    setSetting((setting) => ({...setting, caller: "onRateChange", playbackRate: mediaRef!.playbackRate}))
  }
  const onPlay = () => {}
  const onPause = () => {}
  const onError = () => {}
  const onFullscreenChange = async () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;

    const setting = useMediaStore.getState().setting;
    const fullscreen = document.fullscreenElement === mediaRef;
    console.log('fullscreenchange', fullscreen);
    await commands.toggleFullscreen();
    setFullscreen(fullscreen)

    if (fullscreen) {
      mediaRef!.focus();
    } else {
      if (mediaRef!.paused !== setting!.paused) {
        setSetting((setting) => ({...setting, caller: "onPause", paused: mediaRef!.paused}))
      }
      containerRef?.focus();
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
    const state = useMediaStore.getState();
    return state.setting?.subType == sub.subtype;
  }

  useEffect(() => {
    if (subs.length === 0) return;
    if (setting.subType == undefined) return;
    if (mediaRef === null) return;
    const tracks = mediaRef?.textTracks;

    for (const track of tracks) {
      if (track.label === setting?.subType) {
        track.mode = 'showing';
      } else {
        track.mode = 'hidden';
      }
    }
  }, [setting.subType])

  return (
    <video
      ref={setMediaRef}
      controls={false}
      preload="metadata"
      autoPlay={false}
    >
      <source />
      { subs && subs.map((sub, _index) => (
          <track key={sub.fullpath}
                 label={sub.subtype}
                 kind="subtitles"
                 srcLang={sub.lang}
                 src={sub.src}
                 default={isDefaultSub(sub)}
          />
      ))}
    </video>
  )
}

export default VideoView
import {useEffect, useState} from "react";
import {useVideoStore as useMediaStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";
import {commands} from "@/bindings.ts";
import type {Sub} from "@/types/models";


function VideoView() {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    mediaRef, setMediaRef,
    containerRef,
    setCurrentTime, changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
    loadSrc,
    setFullscreen,
    subs,
  } = useMediaStore();

  useEffect(() => {
    let active = false;
    const controller = new AbortController();
    containerRef?.focus();  // F11
    onMount(controller.signal, () => {active = true;})

    return () => {
      controller.abort();
      if (active) {
        onUnMount().then()
      }
    }
  }, [])

  useEffect(() => {
    const ref = addListener();
    if (ref !== null) {
      const {setting} = useMediaStore.getState();
      loadSrc(setting.mediaPath)
    }
    return () => {
      removeListener(ref);
    }
  },[mediaRef])

  useEffect(() => {
    loadSrc(setting.mediaPath)
  }, [setting.mediaPath])

  useEffect(() => {
    if(mediaRef === null) return;

    const {setting, currentTime} = useMediaStore.getState();

    if(setting.mediaPath == undefined) return;

    console.log('ready state', mediaRef?.readyState, currentTime)

    changeVolume(setting.volume ?? 0.5);
    setCurrentTime(currentTime);
    changeCurrentTime(currentTime)
    changePlaybackRate(setting.playbackRate ?? 1.0);
    changeMuted(setting.muted ?? false)

    if (setting.paused !== mediaRef.paused) {
      if (setting.paused) {
        mediaRef.pause();
      } else {
        mediaRef.play().then();
      }
    }
  }, [setting.paused])

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

  const isNullPlaying = () => {
    const state = useMediaStore.getState();
    if (state.mediaRef === null) return true;
    if (state.setting.mediaPath == undefined) return true;
    if (!state.mediaRef) return true;
    return state.mediaRef.currentSrc === '';
  }

  const isValidSrc = () => {
    const state = useMediaStore.getState();
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(state.setting?.mediaPath ?? '')).href;
    } else {
      settingSrc = srcLocal(state.setting?.mediaPath ?? '')
    }
    return !!state.mediaRef?.currentSrc.endsWith(settingSrc);
  }

  const onloadedMetaData = async () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    console.log('onloadedMetaData')
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
      setCurrentTime(mediaRef!.currentTime)
    } else {
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

  const addListener = () => {
    if (mediaRef) {
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
      return mediaRef;
    }
    return null
  }

  const removeListener = (mediaRef: HTMLVideoElement | null) => {
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

  const isDefaultSub = (sub: Sub) => {
    if (subs.length == 0) return false;
    const state = useMediaStore.getState();
    return state.setting?.subType == sub.subtype;
  }

  if (!isInitialized) return null;
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
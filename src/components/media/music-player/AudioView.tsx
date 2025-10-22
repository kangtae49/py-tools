import {useEffect} from "react";
import {useAudioStore as useMediaStore} from "../useMediaStore.ts";
import {srcLocal} from "@/components/utils.ts";
import useOnload from "@/stores/useOnload.ts";


function AudioView() {
  const {onLoad, onUnload} = useOnload()
  const {
    mediaRef, setMediaRef,
    setCurrentTime, changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
    loadSrc,
  } = useMediaStore();

  onLoad(() => {
    const {setting} = useMediaStore.getState();
    loadSrc(setting.mediaPath)
  })
  onUnload(() => {

  })

  useEffect(() => {
    const ref = addListener();
    if (ref !== null) {
      // const {setting} = useMediaStore.getState();
      // loadSrc(setting.mediaPath)
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

  const addListener = () => {
    if (mediaRef) {
      console.log('Audio View add listener')
      mediaRef.addEventListener("loadeddata", onloadedData);
      mediaRef.addEventListener("loadedmetadata", onloadedMetaData);
      mediaRef.addEventListener("timeupdate", onTimeUpdate);
      mediaRef.addEventListener("volumechange", onVolumeChange);
      mediaRef.addEventListener("ratechange", onRateChange);
      mediaRef.addEventListener("play", onPlay);
      mediaRef.addEventListener("pause", onPause);
      mediaRef.addEventListener("ended", onEnded);
      mediaRef.addEventListener("error", onError);
      return mediaRef;
    }
    return null
  }

  const removeListener = (mediaRef: HTMLAudioElement | null) => {
    if (mediaRef) {
      console.log('Audio View remove listener')
      mediaRef?.removeEventListener("loadedmetadata", onloadedMetaData);
      mediaRef?.removeEventListener("timeupdate", onTimeUpdate);
      mediaRef?.removeEventListener("volumechange", onVolumeChange);
      mediaRef?.removeEventListener("ratechange", onRateChange);
      mediaRef?.removeEventListener("play", onPlay);
      mediaRef?.removeEventListener("pause", onPause);
      mediaRef?.removeEventListener("ended", onEnded);
      mediaRef?.removeEventListener("error", onError);
    }
  }

  return (
    <audio
      ref={setMediaRef}
      controls={false}
      preload="metadata"
      autoPlay={false}
    >
      <source />
    </audio>
  )
}

export default AudioView
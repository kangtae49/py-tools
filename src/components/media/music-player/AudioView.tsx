import {useEffect, useState} from "react";
import {useAudioStore as useMediaStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";


function AudioView() {
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  const {
    mediaRef, setMediaRef,
    currentTime, setCurrentTime, changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
  } = useMediaStore();


  useEffect(() => {
    if (!ready) return;
    loadSrc()
  }, [ready, setting?.mediaPath])

  useEffect(() => {
    if (!ready) return;
    if(mediaRef === null) return;
    if(setting.mediaPath == undefined) return;

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

  const loadSrc = () => {
    const state = useMediaStore.getState();
    if(state.setting.mediaPath == undefined) return;
    if (state.mediaRef === null) return;
    console.log('playPath', state.setting.mediaPath);
    state.mediaRef.src = srcLocal(state.setting.mediaPath);
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
  useEffect(() => {
    if (mediaRef) {
      // refresh start
      console.log('Audio View', mediaRef)
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

    }

    return () => {
      removeListener();
    };

  }, [mediaRef])


  const removeListener = () => {
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

  return (
    <audio
      ref={setMediaRef}
      controls
      preload="metadata"
      autoPlay={false}
    >
      <source />
    </audio>
  )
}

export default AudioView
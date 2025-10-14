import {useEffect, useState} from "react";
import {useAudioStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";


function AudioView() {
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);

  const {
    mediaRef, setMediaRef,
    changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
  } = useAudioStore();


  useEffect(() => {
    if (!ready) return;
    loadSrc()
  }, [ready, setting?.playPath])

  useEffect(() => {
    if (!ready) return;
    if(mediaRef === null) return;
    if(setting.playPath == undefined) return;

    console.log('ready state', mediaRef?.readyState)

    if (setting.paused !== mediaRef.paused) {
      if (setting.paused) {
        mediaRef.pause();
      } else {
        mediaRef.play().then();
      }
    }
  }, [ready, setting.paused]);


  const isNullPlaying = () => {
    const state = useAudioStore.getState();
    if (state.mediaRef === null) return true;
    if (state.setting.playPath == undefined) return true;
    if (!state.mediaRef) return true;
    return state.mediaRef.currentSrc === '';
  }

  const isValidSrc = () => {
    const state = useAudioStore.getState();
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(state.setting?.playPath ?? '')).href;
    } else {
      settingSrc = srcLocal(state.setting?.playPath ?? '')
    }
    return !!state.mediaRef?.currentSrc.endsWith(settingSrc);
  }

  const loadSrc = () => {
    const state = useAudioStore.getState();
    if(state.setting.playPath == undefined) return;
    if (state.mediaRef === null) return;
    console.log('playPath', state.setting.playPath);
    state.mediaRef.src = srcLocal(state.setting.playPath);
    state.mediaRef.load();
  }

  const onloadedMetaData = async () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const state = useAudioStore.getState();

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

    if (isValidSrc()) {
      setSetting((setting) => ({...setting, caller: "onTimeUpdate", currentTime: mediaRef!.currentTime}))
    } else {
      setSetting((setting) => ({...setting, caller: "onTimeUpdate", currentTime: 0}))
    }
  }

  const onEnded = () => {
    if (isNullPlaying()) return;
    if (!isValidSrc()) return;
    const state = useAudioStore.getState();

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
    <div className="audio-player">
      <audio
        ref={setMediaRef}
        controls
        preload="metadata"
        autoPlay={false}
      >
        <source />
      </audio>
    </div>
  )
}

export default AudioView
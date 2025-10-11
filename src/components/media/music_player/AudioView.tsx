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
    if(setting?.playPath == null) return;

    console.log('ready state', mediaRef?.readyState)

    if (setting.paused !== mediaRef.paused) {
      if (setting.paused) {
        mediaRef.pause();
      } else {
        mediaRef.play()?.then();
      }
    }
  }, [ready, setting?.paused]);

  const loadSrc = () => {
    const setting = useAudioStore.getState().setting;
    if(setting?.playPath == null) return;
    if (mediaRef === null) return;
    console.log('playPath', setting.playPath);
    mediaRef.src = srcLocal(setting.playPath);
    mediaRef.load();
  }

  const onloadedMetaData = async () => {
    const setting = useAudioStore.getState().setting;
    if (mediaRef === null) return;
    if (setting === null) return;

    changeVolume(setting.volume);
    changeCurrentTime(setting.currentTime ?? 0);
    changePlaybackRate(setting.playbackRate);
    changeMuted(setting.muted ?? false)
    console.log('duration', mediaRef.duration)

    if (setting.paused !== mediaRef.paused) {
      if (setting.paused) {
        mediaRef.pause();
      } else {
        mediaRef.play()?.then();
      }
    }
  }
  const onloadedData = async () => {
    console.log('onloadedData')
  }

  const onTimeUpdate = () => {
    const state = useAudioStore.getState();
    // const setting = useAudioStore.getState().setting;
    // const setSetting = useAudioStore.getState().setSetting;
    if (state.setting == null) return;
    if (state.setting.playPath == null) return;
    if (!mediaRef) return;
    if (mediaRef.currentSrc === '') return;
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(state.setting.playPath ?? '')).href;
    } else {
      settingSrc = srcLocal(state.setting.playPath ?? '')
    }

    if (mediaRef.currentSrc.endsWith(settingSrc)) {
      state.setSetting({...state.setting, caller: "onTimeUpdate", currentTime: mediaRef.currentTime})
    } else {
      state.setSetting({...state.setting, caller: "onTimeUpdate", currentTime: 0})
    }
  }

  const onEnded = () => {
    const setting = useAudioStore.getState().setting;
    if (setting == null) return;
    if (setting.playPath == null) return;
    if (!mediaRef) return;
    if (mediaRef.currentSrc === '') return;
    mediaRef.loop = false;
    setEnded(true);
  }
  const onVolumeChange = () => {
    const setting = useAudioStore.getState().setting;
    if (setting == null) return;
    if (setting.playPath == null) return;
    if (!mediaRef) return;
    if (mediaRef.currentSrc === '') return;
    setSetting({...setting, caller: "onVolumeChange", volume: mediaRef.volume, muted: mediaRef.muted})
  }
  const onRateChange = () => {
    const setting = useAudioStore.getState().setting;
    if (setting == null) return;
    if (setting.playPath == null) return;
    if (!mediaRef) return;
    if (mediaRef.currentSrc === '') return;
    setSetting({...setting, caller: "onRateChange", playbackRate: mediaRef.playbackRate})
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
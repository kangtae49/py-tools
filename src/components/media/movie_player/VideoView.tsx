import {useEffect, useState} from "react";
import {useVideoStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";


function VideoView() {
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
        mediaRef.play()?.then();
      }
    }
  }, [ready, setting?.paused]);

  const loadSrc = () => {
    const setting = useVideoStore.getState().setting;
    if(setting?.playPath == null) return;
    if (mediaRef === null) return;
    console.log('playPath', setting.playPath);
    mediaRef.src = srcLocal(setting.playPath);
    mediaRef.load();
  }

  const onloadedMetaData = async () => {
    const setting = useVideoStore.getState().setting;
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
    const setting = useVideoStore.getState().setting;
    if (setting == null) return;
    if (setting.playPath == null) return;
    if (!mediaRef) return;
    if (mediaRef.currentSrc === '') return;
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(setting.playPath ?? '')).href;
    } else {
      settingSrc = srcLocal(setting.playPath ?? '')
    }

    if (mediaRef.currentSrc.endsWith(settingSrc)) {
      setSetting({...setting, caller: "onTimeUpdate", currentTime: mediaRef.currentTime})
    } else {
      setSetting({...setting, caller: "onTimeUpdate", currentTime: 0})
    }
  }

  const onEnded = () => {
    setEnded(true);
  }
  const onVolumeChange = () => {}
  const onRateChange = () => {}
  const onPlay = () => {}
  const onPause = () => {}
  const onError = () => {}
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
    <div className="video-player">
      <video
        ref={setMediaRef}
        controls={false}
        preload="metadata"
        autoPlay={false}
      >
        <source />
      </video>
    </div>
  )
}

export default VideoView
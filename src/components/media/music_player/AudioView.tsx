import {useCallback, useEffect} from "react";
import {useAudioStore} from "../mediaStore.ts";
import {srcLocal} from "@/components/utils.ts";


function AudioView() {
  const {
    mediaRef, setMediaRef,
    changeCurrentTime,
    changeVolume,
    changeMuted,
    setEnded,
    changePlaybackRate,
    setting, setSetting,
  } = useAudioStore();

  const onloadedData = useCallback(async () => {
    if (setting === null) return;
    if (mediaRef === null) return;

    changeVolume(setting.volume);
    changeCurrentTime(setting.currentTime ?? 0);
    changePlaybackRate(setting.playbackRate);
    changeMuted(setting.muted ?? false)
    // setSetting({...setting, currentTime: newCurrentTime})
    console.log('duration', mediaRef.duration)

    if (setting.paused) {
      mediaRef.pause();
    } else {
      mediaRef.play()?.then();
    }

  }, [setting])

  const onloadedMetaData = async () => {
    if (!mediaRef) return;
  }

  const onTimeUpdate = useCallback(() => {
    if (!mediaRef) return;
    if (setting == null) return;
    if (setting.currentTime === -1) return;
    let settingSrc;
    if (import.meta.env.PROD) {
      settingSrc = new URL(srcLocal(setting.playPath ?? '')).href;
    } else {
      settingSrc = srcLocal(setting.playPath ?? '')
    }

    if (mediaRef.currentSrc.endsWith(settingSrc)) {
      setSetting({...setting, currentTime: mediaRef.currentTime})
    } else {
      setSetting({...setting, currentTime: 0})
    }
  }, [setting])

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
      mediaRef?.addEventListener("loadeddata", onloadedData);
      mediaRef?.addEventListener("loadedmetadata", onloadedMetaData);
      mediaRef?.addEventListener("timeupdate", onTimeUpdate);
      mediaRef?.addEventListener("volumechange", onVolumeChange);
      mediaRef?.addEventListener("ratechange", onRateChange);
      mediaRef?.addEventListener("play", onPlay);
      mediaRef?.addEventListener("pause", onPause);
      mediaRef?.addEventListener("ended", onEnded);
      mediaRef?.addEventListener("error", onError);
    }

    return () => {
      mediaRef?.removeEventListener("loadedmetadata", onloadedMetaData);
      mediaRef?.removeEventListener("timeupdate", onTimeUpdate);
      mediaRef?.removeEventListener("volumechange", onVolumeChange);
      mediaRef?.removeEventListener("ratechange", onRateChange);
      mediaRef?.removeEventListener("play", onPlay);
      mediaRef?.removeEventListener("pause", onPause);
      mediaRef?.removeEventListener("ended", onEnded);
      mediaRef?.removeEventListener("error", onError);
    };

  }, [setting])

  return (
    <div className="audio-player">
      <audio
        key={setting?.playPath}
        ref={setMediaRef}
        controls
        autoPlay={false}
      >
        <source src={srcLocal(setting?.playPath ?? '')} />
      </audio>
    </div>
  )
}

export default AudioView
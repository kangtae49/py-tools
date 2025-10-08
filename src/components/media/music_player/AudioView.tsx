import {useEffect} from "react";
import {useAudioStore} from "../mediaStore.ts";
import {useMusicPlayListStore} from "./musicPlayListStore.ts";
import {srcLocal} from "@/components/utils.ts";


function AudioView() {
  const {playPath} = useMusicPlayListStore();
  const {
    mediaRef, setMediaRef,
    setDuration,
    setCurrentTime, changeCurrentTime,
    setVolume, changeVolume,
    play,
    pause, setPaused,
    setMuted, changeMuted,
    setPlaybackRate,
    setEnded,
    changePlaybackRate,
    setting,
  } = useAudioStore();

  const onloadedData = async () => {
    if (!mediaRef) return;
    // setSrc(mediaRef.src);
    if (playPath == null) return;
    setDuration(mediaRef.duration);

    if (setting){
      changeVolume(setting.volume);
      changeCurrentTime(setting.currentTime);
      changePlaybackRate(setting.playbackRate);
      changeMuted(setting.muted ?? false)
    }
    console.log('duration', mediaRef.duration)

    if (!setting?.paused) {
      play()?.then();
    } else {
      pause();
    }

  }

  const onloadedMetaData = async () => {
    if (!mediaRef) return;
  }

  const onTimeUpdate = () => {
    if (!mediaRef) return;
    setCurrentTime(mediaRef.currentTime);
  }

  const onVolumeChange = () => {
    if (!mediaRef) return;
    setVolume(mediaRef.volume);
    setMuted(mediaRef.muted);
  }
  const onRateChange = () => {
    if (!mediaRef) return;
    setPlaybackRate(mediaRef.playbackRate)
  }
  const onPlay = () => {
    setPaused(false);
  }
  const onPause = () => {
    setPaused(true);
  }

  const onEnded = () => {
    setPaused(true);
    setEnded(true);
  }

  const onError = () => {
    console.log('onError')
  }


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

  }, [mediaRef])

  if (playPath === null) return;
  return (
    <div className="audio-player">
      <audio
        key={playPath}
        ref={setMediaRef}
        controls
        autoPlay={false}
      >
        <source src={srcLocal(playPath)} />
      </audio>
    </div>
  )
}

export default AudioView
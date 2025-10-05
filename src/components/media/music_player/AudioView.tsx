import {useEffect, useRef} from "react";
import {useAudioStore} from "../mediaStore.ts";
import {useMusicPlayListStore} from "./musicPlayListStore.ts";
import {srcLocal} from "@/components/utils.ts";


function AudioView() {
  const {playPath} = useMusicPlayListStore();
  const ref = useRef<HTMLAudioElement | null>(null);
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
    setSrc,
  } = useAudioStore();

  const onloadedData = async () => {
    if (!mediaRef?.current) return;
    setSrc(mediaRef.current.src);
    if (playPath == null) return;
    if (setting == null) return;
    changeVolume(setting.volume);
    changeCurrentTime(setting.currentTime);
    changePlaybackRate(setting.playbackRate);
    changeMuted(setting.muted)
    if (!setting.paused) {
      play()?.then();
    } else {
      pause();
    }

    setDuration(mediaRef.current.duration);
  }

  const onloadedMetaData = async () => {
    if (!mediaRef?.current) return;
  }

  const onTimeUpdate = () => {
    if (!mediaRef?.current) return;
    setCurrentTime(mediaRef.current.currentTime);
  }

  const onVolumeChange = () => {
    if (!mediaRef?.current) return;
    setVolume(mediaRef.current.volume);
    setMuted(mediaRef.current.muted);
  }
  const onRateChange = () => {
    if (!mediaRef?.current) return;
    setPlaybackRate(mediaRef.current.playbackRate)
  }
  const onPlay = () => {
    setPaused(false);
  }
  const onPause = () => {
    setPaused(true);
  }

  const onEnded = () => {
    console.log("onEnded !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    setPaused(true);
    setEnded(true);
  }


  useEffect(() => {
    if (ref === null) return;

    setMediaRef(ref);
  }, [playPath])

  useEffect(() => {
    // if (!mediaRef?.current) return;

    // audioRef.current.volume = 0.5;
    mediaRef?.current?.addEventListener("loadeddata", onloadedData);
    mediaRef?.current?.addEventListener("loadedmetadata", onloadedMetaData);
    mediaRef?.current?.addEventListener("timeupdate", onTimeUpdate);
    mediaRef?.current?.addEventListener("volumechange", onVolumeChange);
    mediaRef?.current?.addEventListener("ratechange", onRateChange);
    mediaRef?.current?.addEventListener("play", onPlay);
    mediaRef?.current?.addEventListener("pause", onPause);
    mediaRef?.current?.addEventListener("ended", onEnded);


    return () => {
      mediaRef?.current?.removeEventListener("loadedmetadata", onloadedMetaData);
      mediaRef?.current?.removeEventListener("timeupdate", onTimeUpdate);
      mediaRef?.current?.removeEventListener("volumechange", onVolumeChange);
      mediaRef?.current?.removeEventListener("ratechange", onRateChange);
      mediaRef?.current?.removeEventListener("play", onPlay);
      mediaRef?.current?.removeEventListener("pause", onPause);
      mediaRef?.current?.removeEventListener("ended", onEnded);
    };

  }, [playPath, mediaRef?.current])

  if (playPath === null) return;
  return (
    <div className="audio-player">
      <audio key={playPath} ref={ref} controls autoPlay={false}>
        <source src={srcLocal(playPath)} />
      </audio>
    </div>
  )
}

export default AudioView
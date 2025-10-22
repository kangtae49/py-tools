// import {usePictureStore} from "@/components/media/picture-player/pictureStore.ts";
import {getFilename, srcLocal} from "@/components/utils.ts";
import {useEffect, useRef, useState} from "react";
import {usePictureStore as useMediaStore} from "@/components/media/picture-player/pictureStore.ts";
// import {commands} from "@/bindings.ts";

interface Prop {
  width: number
  height: number
}
function ImageView({width, height}: Prop) {
  const [isInitialized, setIsInitialized] = useState(false);

  const [opacity, setOpacity] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const {
    // mediaRef, setMediaRef,
    containerRef,
    setViewType,
    setting, // setSetting,
    // setFullscreen,
  } = useMediaStore()



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
  }, []);

  useEffect(() => {
    if (setting.mediaPath) {
      setOpacity(0);
    }
  }, [setting.mediaPath])

  // useEffect(() => {
  //   const ref = addListener();
  //   if (ref !== null) {
  //     loadSrc()
  //   }
  //   return () => {
  //     removeListener(ref);
  //   }
  // },[mediaRef])

  const onMount = async (signal: AbortSignal, onComplete: () => void) => {
    console.log('onMount', signal)
    await Promise.resolve();

    if(signal?.aborted) {
      console.log('onMount Aborted')
      return;
    }

    // do something
    loadSrc()

    onComplete();
    setIsInitialized(true)
    console.log('onMount Completed')
  }

  const onUnMount = async () => {
    console.log('onUnMount')
  }

  const loadSrc = () => {
    const {setting} = useMediaStore.getState();
    if (setting.mediaPath) {
      if(imageRef.current?.complete) {
        setOpacity(1);
      }
    }
  }

  // const onFullscreenChange = async () => {
  //
  //   // const setting = useMediaStore.getState().setting;
  //   const fullscreen = document.fullscreenElement === mediaRef;
  //   console.log('fullscreenchange', fullscreen);
  //   await commands.toggleFullscreen();
  //   setFullscreen(fullscreen)
  //
  //   if (fullscreen) {
  //     mediaRef!.focus();
  //   } else {
  //     containerRef?.focus();
  //   }
  // }

  // const addListener = () => {
  //   if (mediaRef) {
  //     console.log('Image View add listener')
  //     mediaRef.addEventListener("fullscreenchange", onFullscreenChange)
  //     return mediaRef;
  //   }
  //   return null
  // }
  //
  // const removeListener = (mediaRef: HTMLDivElement | null) => {
  //   if (mediaRef) {
  //     console.log('Image View remove listener')
  //     mediaRef?.removeEventListener("fullscreenchange", onFullscreenChange);
  //   }
  // }

  if (!isInitialized) return null;
  return (
    <div className="picture-image"
         style={
            {width, height, opacity}
         }
         onLoad={() => setOpacity(1)}
         onClick={() => setViewType('grid')}
    >
      {setting.mediaPath && <img
          ref={imageRef}
          src={srcLocal(setting.mediaPath)}
          loading="lazy"
          alt={getFilename(setting.mediaPath)}
      />}
    </div>
  )
}

export default ImageView

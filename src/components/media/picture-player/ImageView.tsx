import {getFilename, srcLocal} from "@/components/utils.ts";
import {useRef, useState} from "react";
import {usePictureStore as useMediaStore} from "@/components/media/picture-player/usePictureStore.ts";
import useOnload from "@/stores/useOnload.ts";

interface Prop {
  width: number
  height: number
}
function ImageView({width, height}: Prop) {
  const {onLoad, useReadyEffect} = useOnload()
  const [opacity, setOpacity] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const {
    setViewType,
    setting,
  } = useMediaStore()

  onLoad(() => {
    console.log('onLoad')
    loadSrc()
    // containerRef?.focus();  // F11
  })

  useReadyEffect(() => {
    if (setting.mediaPath && !imageRef.current?.complete) {
      setOpacity(0);
    }
  }, [setting.mediaPath])


  const loadSrc = () => {
    const {setting} = useMediaStore.getState();
    if (setting.mediaPath) {
      if(imageRef.current?.complete) {
        setOpacity(1);
      }
    }
  }

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

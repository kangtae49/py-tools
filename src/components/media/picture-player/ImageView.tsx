import {usePictureStore} from "@/components/media/picture-player/pictureStore.ts";
import {getFilename, srcLocal} from "@/components/utils.ts";
import {useEffect, useRef, useState} from "react";

interface Prop {
  width: number
  height: number
}
function ImageView({width, height}: Prop) {
  const [opacity, setOpacity] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const {
    setMediaRef,
    setViewType,
    setting,

  } = usePictureStore()

  useEffect(() => {
    if (setting.mediaPath) {
      setOpacity(0);
    }
  }, [setting.mediaPath])

  useEffect(() => {
    if(imageRef.current?.complete) {
      setOpacity(1);
    }
  }, []);

  return (
    <div className="picture-image"
         style={
            {width, height, opacity}
         }
      ref={setMediaRef}
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

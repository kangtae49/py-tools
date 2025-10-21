import {usePictureStore} from "@/components/media/picture-player/pictureStore.ts";
import {getFilename, srcLocal} from "@/components/utils.ts";
import {useEffect, useState} from "react";

interface Prop {
  width: number
  height: number
}
function ImageView({width, height}: Prop) {
  const [opacity, setOpacity] = useState(0);
  const {
    setMediaRef,
    setViewType,
    setting,
  } = usePictureStore()

  useEffect(() => {
    setOpacity(0);
  }, [setting.mediaPath])

  return (
    <div className="picture-image"
         style={
            {width, height, opacity}
         }
      ref={setMediaRef}
         onLoad={() => setOpacity(1)}
         onClick={() => setViewType('grid')}
    >
      {setting.mediaPath && <img src={srcLocal(setting.mediaPath)}
           loading="lazy"
           alt={getFilename(setting.mediaPath)}
      />}
    </div>
  )
}

export default ImageView

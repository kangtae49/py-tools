import {usePictureStore} from "@/components/media/picture-player/pictureStore.ts";
import {getFilename, srcLocal} from "@/components/utils.ts";

interface Prop {
  width: number
  height: number
}
function ImageView({width, height}: Prop) {
  const {
    setMediaRef,
    setViewType,
    setting,
  } = usePictureStore()

  return (
    <div className="picture-image" style={{width, height}}
      ref={setMediaRef}
         onClick={() => setViewType('grid')}
    >
      {setting.mediaPath && <img src={srcLocal(setting.mediaPath)}
           // loading="lazy"
           alt={getFilename(setting.mediaPath)}
      />}
    </div>
  )
}

export default ImageView

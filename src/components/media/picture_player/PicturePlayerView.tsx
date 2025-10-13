import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

interface Prop {
  winKey: WinKey
}

export default function PicturePlayerView({winKey: _}: Prop) {
  return (
    <div className={`widget picture-player`}>
      Picture Player
    </div>
  )
}
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

interface Prop {
  winKey: WinKey
}
export default function AboutView({winKey}: Prop) {
  return (
    <div>
      About {winKey}
    </div>
  )
}

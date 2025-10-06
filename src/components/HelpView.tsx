import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

interface Prop {
  winKey: WinKey
}

export default function HelpView({winKey}: Prop) {
  return (
    <div>
      Help {winKey}
    </div>
  )
}

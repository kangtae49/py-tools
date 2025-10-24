import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import logo from "../../assets/tr-tools.svg"
import "./AboutView.css"
import useOnload from "@/stores/useOnload.ts";
interface Prop {
  winKey: WinKey
}
export default function AboutView({winKey: _}: Prop) {
  const {onLoad, onUnload} = useOnload();

  onLoad(() => {
    console.log("onLoad")
  })

  onUnload(() => {
  })
  return (
    <div className="widget about"
         tabIndex={0}>
      <div className="box">
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>
        <div className="content">
          <h2>PyTools v0.1.0</h2>
          <p>Powered by open-source software</p>
          <a href="https://github.com/kangtae49/py-tools" target="_blank">Home</a>
        </div>
      </div>
    </div>
  )
}

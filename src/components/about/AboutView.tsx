import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import logo from "../../assets/tr-tools.svg"
import "./AboutView.css"
interface Prop {
  winKey: WinKey
}
export default function AboutView({winKey: _}: Prop) {
  return (
    <div className="widget about" >
      <div className="logo">
        <img src={logo} alt="logo" />
      </div>
      <div className="content">
        <h2>PyTools v0.1.0</h2>

        <p>Powered by open-source software</p>
        <a href="https://github.com/kangtae49/py-tools" target="_blank">Home</a>
      </div>
    </div>
  )
}

import './App.css'
import {useEffect, useState} from "react";
import {commands} from "./bindings";
import {srcLocal} from "./components/utils.ts";

function App() {

  const [mp3, setMp3] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  const clickOpenMp3 = () => {
    commands.dialog_open({
      dialog_type: "OPEN"
    }).then((result) => {
      if(result.status === "ok") {
        const files = result.data;
        if (files !== null) {
          // const path = "file://" + files[0].replace(/\\/g, "/");
          const path = files[0];

          setMp3(path);

        }
      }
    })
  }

  const clickOpenFile = () => {
    commands.dialog_open({
      dialog_type: "OPEN"
    }).then(async (result) => {
      if(result.status === "ok") {
        const files = result.data;
        if (files !== null) {
          // const path = "file://" + files[0].replace(/\\/g, "/");
          const path = files[0];
          fetch(srcLocal(path))
          .then(res => res.text())
          .then((text) => {
            console.log(text)
            setText(text);
          })
        }
      }
    })
  }

  useEffect(() => {
    // window.pywebview.api.dialog_open({
    //   dialog_type: "OPEN",
    // }).then((files) => console.log(files))
    console.log("hello")
    // setText(null)
  }, [])
  return (
    <div className="app">
      <div>[{window.location.href}]</div>
      {import.meta.env.PROD && <div>PROD</div>}
      {import.meta.env.DEV && <div>DEV</div>}
      <div onClick={clickOpenMp3}>Open Mp3</div>
      {mp3 !== null &&
      <audio controls>
        <source src={srcLocal(mp3)}></source>
      </audio>
      }
      <div onClick={clickOpenFile}>Get TextFile</div>
      {text !== null &&
      <textarea>
        {text}
      </textarea>
      }
      <div>
        <a href="https://google.com">google</a>
      </div>
    </div>
  )
}

export default App

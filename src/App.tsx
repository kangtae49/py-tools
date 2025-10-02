import './App.css'
import * as React from "react";
import {useEffect, useState} from "react";
import {commands} from "./bindings";
import {srcLocal} from "./components/utils.ts";
import {useReceivedDropFilesStore} from "./stores/useReceivedDropFilesStore.ts";
import {DropFilesListener} from "./listeners/DropFilesListener.tsx";
import type {DropFile} from "./types/models";

function App() {

  const [mp3, setMp3] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const {receivedDropFiles, getDropFiles, setFileList} = useReceivedDropFilesStore();
  const [dropFiles, setDropFiles] = useState<DropFile[] | null>(null);
  const clickOpenMp3 = () => {
    commands.dialog_open({
      dialog_type: "OPEN"
    }).then((result) => {
      if(result.status === "ok") {
        const files = result.data;
        if (files !== null) {
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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('handleDrop');
    event.preventDefault();
    setFileList(event.dataTransfer.files);
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    // console.log("receivedDropFiles:", receivedDropFiles);
    const newDropFiles = getDropFiles();
    console.log("dropFiles:", newDropFiles);
    if (newDropFiles !== null) {
      setDropFiles(newDropFiles);
    }
  }, [receivedDropFiles]);

  return (
    <>
      <DropFilesListener/>
      <div className="app">
        <h1>Pywebview</h1>
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
          <a href="https://nomcopter.github.io/react-mosaic/">mosaic</a>
        </div>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{width: "200px", height: "200px", backgroundColor: "#efefef"}}>
          File Drop Zone1
          {dropFiles && dropFiles.map((file) => <div key={file.pywebviewFullPath}>{file.pywebviewFullPath}</div>)}
        </div>
      </div>
    </>
  )
}

export default App

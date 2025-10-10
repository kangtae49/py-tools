import './MosaicLayoutView.css'
import React, {type JSX, useEffect} from "react";
import AboutView from "@/components/about/AboutView.tsx";
import HelpView from "@/components/help/HelpView.tsx";
import {DefaultToolbarButton, Mosaic, MosaicWindow} from "react-mosaic-component";
import 'react-mosaic-component/react-mosaic-component.css'
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import {type WinKey, type WinType, getWinType, useMosaicStore} from "./mosaicStore.ts";
import MusicPlayerView from "@/components/media/music_player/MusicPlayerView.tsx";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faMusic
} from '@fortawesome/free-solid-svg-icons'
interface TitleInfo {
  title: string,
  icon: JSX.Element,
  // view: JSX.Element,
  view: (winKey: WinKey) => JSX.Element,
}

const ELEMENT_MAP: Record<WinType, TitleInfo> = {
  "about": {
    title: "About",
    icon: <div />,
    view: (winKey) => (<AboutView winKey={winKey} />)
  },
  "help": {
    title: "Help",
    icon: <div />,
    view: (winKey: WinKey) => (<HelpView winKey={winKey} />)
  },
  "music-player": {
    title: "Music Player",
    icon: <div><Icon icon={faMusic} /></div>,
    view: (winKey: WinKey) => (<MusicPlayerView winKey={winKey} />)
  },
  "movie-player": {
    title: "Movie Player",
    icon: <div><Icon icon={faMusic} /></div>,
    view: (winKey: WinKey) => (<HelpView winKey={winKey} />)
  },
  "monaco": {
    title: "Monaco Editor",
    icon: <div />,
    view: (winKey: WinKey) => (<HelpView winKey={winKey} />)
  },
  "md": {
    title: "MdEditor",
    icon: <div />,
    view: (winKey: WinKey) => (<HelpView winKey={winKey} />)
  },
  // "music_player": {
  //   title: "Music Player",
  //   icon: <div><Icon icon={faMusic} /></div>,
  //   view: <MusicPlayerView/>
  // }
}

export function MosaicLayoutView() {
  const {
    // minimizeView, maximizeView,
    removeView,
    mosaicValue, setMosaicValue,
    updateViewRef,
    maxScreenView, setMaxScreenView,
  } = useMosaicStore();

  const toggleMaximizeView = async (e: React.MouseEvent, id: WinKey) => {
    if ((document as any).webkitFullscreenElement) {
      document.exitFullscreen().then(()=>{
        setMaxScreenView(null)
      });
    } else {
      e.currentTarget.closest(".mosaic-window")?.requestFullscreen().then();
      setMaxScreenView(id)
    }
  }

  useEffect(() => {
    setMosaicValue({
      direction: "row",
      first: "music-player",
      second: {
        direction: "column",
        first: "about",
        second: "help"
      }
    })
  }, [])


  return (
    <Mosaic<WinKey>
      value={mosaicValue}
      onChange={setMosaicValue}
      renderTile={(id, path) => (
        <MosaicWindow<WinKey>
          path={path}
          title={id}
          renderToolbar={()=> (
            <div className="title-bar"
              ref={(el) => updateViewRef(id, el)}
            >
              <div className="title"
                onDoubleClick={(e) => toggleMaximizeView(e, id)}
              >
                {ELEMENT_MAP[getWinType(id)].icon}<div>{ELEMENT_MAP[getWinType(id)].title}</div>
              </div>
              <div className="controls">
                {/*<DefaultToolbarButton*/}
                {/*  title="Minimize"*/}
                {/*  onClick={() => minimizeView(id)}*/}
                {/*  className="bp6-icon-minus"*/}
                {/*/>*/}

                <DefaultToolbarButton
                  title={maxScreenView === id ? "Minimize" : "Maximize"}
                  onClick={(e) => toggleMaximizeView(e, id)}
                  className={maxScreenView === id ? "bp6-icon-minus" : "bp6-icon-maximize"}
                />
                <DefaultToolbarButton
                  title="Close Window"
                  onClick={() => removeView(id)}
                  className="mosaic-default-control bp6-button bp6-minimal close-button bp6-icon-cross"
                />
              </div>
            </div>
          )}
        >
          {ELEMENT_MAP[getWinType(id)].view(id)}
        </MosaicWindow>
      )}
      className="mosaic-blueprint-theme"
      blueprintNamespace="bp6"
    />
  )
}
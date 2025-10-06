import './MosaicLayoutView.css'
import React, {type JSX, useEffect, useState} from "react";
import AboutView from "@/components/AboutView.tsx";
import HelpView from "@/components/HelpView.tsx";
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
  view: JSX.Element,
}

const ELEMENT_MAP: Record<WinType, TitleInfo> = {
  "about": {
    title: "About",
    icon: <div />,
    view: <AboutView/>
  },
  "help": {
    title: "Help",
    icon: <div />,
    view: <HelpView/>
  },
  "music-player": {
    title: "Music Player",
    icon: <div><Icon icon={faMusic} /></div>,
    view: <MusicPlayerView />
  },
  "movie-player": {
    title: "Movie Player",
    icon: <div><Icon icon={faMusic} /></div>,
    view: <HelpView/>
  },
  "monaco": {
    title: "Monaco Editor",
    icon: <div />,
    view: <HelpView/>
  },
  "md": {
    title: "MdEditor",
    icon: <div />,
    view: <HelpView/>
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
  } = useMosaicStore();

  const [maxScreen, setMaxScreen] = useState<boolean>(false);
  const toggleMaximizeView = (e: React.MouseEvent, _id: WinKey) => {
    if ((document as any).webkitFullscreenElement) {
      document.exitFullscreen();
      setMaxScreen(false)
    } else {
      e.currentTarget.closest(".mosaic-window")?.requestFullscreen();
      setMaxScreen(true)
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
            <div className="title-bar">
              <div className="title">
                {ELEMENT_MAP[getWinType(id)].icon}<div>{ELEMENT_MAP[getWinType(id)].title}</div>
              </div>
              <div className="controls">
                {/*<DefaultToolbarButton*/}
                {/*  title="Minimize"*/}
                {/*  onClick={() => minimizeView(id)}*/}
                {/*  className="bp6-icon-minus"*/}
                {/*/>*/}

                <DefaultToolbarButton
                  title={maxScreen ? "Minimize" : "Maximize"}
                  onClick={(e) => toggleMaximizeView(e, id)}
                  className={maxScreen ? "bp6-icon-minus" : "bp6-icon-maximize"}
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
          {ELEMENT_MAP[getWinType(id)].view}
        </MosaicWindow>
      )}
      className="mosaic-blueprint-theme"
      blueprintNamespace="bp6"
    />
  )
}
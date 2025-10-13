import './MosaicLayoutView.css'
import React, {type JSX, useEffect, useState} from "react";
import AboutView from "@/components/about/AboutView.tsx";
import HelpView from "@/components/help/HelpView.tsx";
import {DefaultToolbarButton, Mosaic, MosaicWindow} from "react-mosaic-component";
import 'react-mosaic-component/react-mosaic-component.css'
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import {type WinKey, type WinType, getWinType, useMosaicStore, defaultLayout} from "./mosaicStore.ts";
import MusicPlayerView from "@/components/media/music_player/MusicPlayerView.tsx";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faMusic, faFilm,
} from '@fortawesome/free-solid-svg-icons'
import MoviePlayerView from "@/components/media/movie_player/MoviePlayerView.tsx";
import {commands} from "@/bindings.ts";
import {videoDefault} from "@/components/media/mediaStore.ts";
import PicturePlayerView from "@/components/media/picture_player/PicturePlayerView.tsx";

export const MOSAIC_LAYOUT_SETTING = 'mosaic-layout.setting.json'

interface TitleInfo {
  title: string,
  icon: JSX.Element,
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
    title: "Music",
    icon: <div><Icon icon={faMusic} /></div>,
    view: (winKey: WinKey) => (<MusicPlayerView winKey={winKey} />)
  },
  "movie-player": {
    title: "Movie",
    icon: <div><Icon icon={faFilm} /></div>,
    view: (winKey: WinKey) => (<MoviePlayerView winKey={winKey} />)
  },
  "picture-player": {
    title: "Picture",
    icon: <div><Icon icon={faFilm} /></div>,
    view: (winKey: WinKey) => (<PicturePlayerView winKey={winKey} />)
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
  const [initialized, setInitialized] = useState(false);
  const {
    // minimizeView, maximizeView,
    removeView,
    mosaicValue, setMosaicValue,
    updateViewRef,
    maxScreenView, setMaxScreenView,
    setReady,
  } = useMosaicStore();

  const toggleMaximizeView = async (e: React.MouseEvent, id: WinKey) => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(()=>{
        setMaxScreenView(null)
      });
    } else {
      e.currentTarget.closest(".mosaic-window")?.requestFullscreen().then();
      setMaxScreenView(id)
    }
  }

  const onMount = async () => {
    console.log('onMount')

    const result = await commands.appReadFile(MOSAIC_LAYOUT_SETTING);
    let newSetting;
    if (result.status === 'ok') {
      newSetting = JSON.parse(result.data);
      if (result.data === "{}") {
        newSetting = videoDefault.setting ?? null;
      }
      commands.appWrite(MOSAIC_LAYOUT_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', MOSAIC_LAYOUT_SETTING);
      })
    } else {
      newSetting = defaultLayout;
      commands.appWrite(MOSAIC_LAYOUT_SETTING, JSON.stringify(newSetting, null, 2)).then((result) => {
        console.log(result.status, 'appWrite', MOSAIC_LAYOUT_SETTING);
      })
      commands.appWriteFile(MOSAIC_LAYOUT_SETTING, "").then((result) => {
        console.log(result.status, 'appWriteFile', MOSAIC_LAYOUT_SETTING);
      })
    }
    setMosaicValue(newSetting);
  }

  const onUnMount = async () => {
    console.log('onUnMount')
    const state = useMosaicStore.getState();
    if (state.ready) {
      commands.appWriteFile(MOSAIC_LAYOUT_SETTING, "").then((result) => {
        console.log(result.status, 'appWriteFile', MOSAIC_LAYOUT_SETTING);
      })
    }
  }

  useEffect(() => {
    // const state = useMosaicStore.getState();
    // if(!state.ready) return;
    // if(mosaicValue === null) return;
    console.log('mosaicValue', mosaicValue);
    commands.appWrite(MOSAIC_LAYOUT_SETTING, JSON.stringify(mosaicValue, null, 2)).then((result) => {
      console.log(result.status, 'appWrite', MOSAIC_LAYOUT_SETTING);
    })
  }, [mosaicValue])


  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      onMount().then(() => {
        setReady(true);
      });
    }
    return () => {
      onUnMount().then();
    }
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
                  // title={document.fullscreenElement !== null ? "Minimize" : "Maximize"}
                  onClick={(e) => toggleMaximizeView(e, id)}
                  className={maxScreenView === id ? "bp6-icon-minus" : "bp6-icon-maximize"}
                  // className={document.fullscreenElement !== null ? "bp6-icon-minus" : "bp6-icon-maximize"}
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
import './MosaicLayoutView.css'
import React, {type JSX} from "react";
import AboutView from "@/components/about/AboutView.tsx";
import HelpView from "@/components/help/HelpView.tsx";
import {DefaultToolbarButton, Mosaic, MosaicWindow} from "react-mosaic-component";
import 'react-mosaic-component/react-mosaic-component.css'
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import {type WinKey, type WinType, getWinType, useMosaicStore} from "./mosaicStore.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faMusic, faFilm,
} from '@fortawesome/free-solid-svg-icons'
import MusicPlayerView from "@/components/media/music-player/MusicPlayerView.tsx";
import MoviePlayerView from "@/components/media/movie-player/MoviePlayerView.tsx";
import PicturePlayerView from "@/components/media/picture-player/PicturePlayerView.tsx";
import MosaicSettingListener from "./MosaicSettingListener.tsx";
import useOnload from "@/stores/useOnload.ts";

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

function MosaicLayoutView() {
  const {useReadyEffect} = useOnload()

  const {
    // minimizeView, maximizeView,
    setSetting,
    removeView,
    mosaicValue, setMosaicValue,
    updateViewRef,
    maxScreenView, setMaxScreenView,
  } = useMosaicStore();

  useReadyEffect(() => {
    setSetting((setting) => ({...setting, layout: mosaicValue}))
  }, [mosaicValue])

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

  return (
    <>
      <MosaicSettingListener />
      <Mosaic<WinKey>
        value={mosaicValue}
        onChange={setMosaicValue}
        renderTile={(id, path) => (
            <MosaicWindow<WinKey>
              key={id}
              path={path}
              title={id}
              renderToolbar={()=> (
                <div className={`title-bar`}
                     onClick={(e) => {
                       const widget = (e.target as HTMLElement).closest(".mosaic-window")?.querySelector(".widget");
                       if (widget) {
                         (widget as HTMLElement).focus()
                       }
                     }}
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
                      // className={maxScreenView === id ? "bp6-icon-minus" : "bp6-icon-maximize"}
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
    </>
  )
}

export default MosaicLayoutView
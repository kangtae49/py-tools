import "./AppMenuView.css"
import {useEffect, useState} from "react";
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faMusic,
  faFilm, faImage,
} from '@fortawesome/free-solid-svg-icons'
import {useMosaicStore, type WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

function AppMenuView() {
  const [isInitialized, setIsInitialized] = useState(false);
  const {addView, maxScreenView, setMaxScreenView} = useMosaicStore();

  useEffect(() => {
    let active = false;
    const controller = new AbortController();
    onMount(controller.signal, () => {active = true;})

    return () => {
      controller.abort();
      if (active) {
        onUnMount().then()
      }
    }
  }, [])

  const onMount = async (signal: AbortSignal, onComplete: () => void) => {
    console.log('onMount', signal)
    await Promise.resolve();

    if(signal?.aborted) {
      console.log('onMount Aborted')
      return;
    }

    // do something

    onComplete();
    setIsInitialized(true)
    console.log('onMount Completed')
  }

  const onUnMount = async () => {
    console.log('onUnMount')
  }

  const clickMenu = (_e: any, menu: WinKey) => {
    console.log('clickMenu', menu)
    addView(menu)
    if ((document as any).webkitFullscreenElement && maxScreenView !== menu) {
      document.exitFullscreen().then()
      setMaxScreenView(null)
    }
  }

  if (!isInitialized) return null;
  return (
    <div className="app-menu">
      <Menu menuButton={<MenuButton>Media</MenuButton>} transition className="menu">
        <MenuItem className="menu-item"
                  value="movie-player"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          <Icon icon={faFilm}/>Movie
        </MenuItem>
        <MenuItem className="menu-item"
                  value="music-player"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          <Icon icon={faMusic}/>Music
        </MenuItem>
        <MenuItem className="menu-item"
                  value="picture-player"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          <Icon icon={faImage}/>Picture
        </MenuItem>
      </Menu>
      <Menu menuButton={<MenuButton>Help</MenuButton>} transition>
        <MenuItem className="menu-item"
                  value="about"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          About
        </MenuItem>
        <MenuItem className="menu-item"
                  value="help"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          Help
        </MenuItem>
      </Menu>
    </div>
  )
}

export default AppMenuView

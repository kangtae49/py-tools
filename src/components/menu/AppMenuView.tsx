import "./AppMenuView.css"
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/zoom.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {
  faMusic,
  faFilm,
} from '@fortawesome/free-solid-svg-icons'
import {useMosaicStore, type WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";

function AppMenuView() {
  const {addView, maxScreenView, setMaxScreenView} = useMosaicStore();
  const clickMenu = (_e: any, menu: WinKey) => {
    console.log('clickMenu', menu)
    addView(menu)
    if ((document as any).webkitFullscreenElement && maxScreenView !== menu) {
      document.exitFullscreen().then()
      setMaxScreenView(null)
    }
  }

  return (
    <div className="app-menu">
      <Menu menuButton={<MenuButton>Media</MenuButton>} transition className="menu">
        <MenuItem className="menu-item"
                  value="movie-player"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          <Icon icon={faFilm}/>Movie Player
        </MenuItem>
        <MenuItem className="menu-item"
                  value="music-player"
                  onClick={(e: any) => clickMenu(e, e.value)}>
          <Icon icon={faMusic}/>Music Player
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

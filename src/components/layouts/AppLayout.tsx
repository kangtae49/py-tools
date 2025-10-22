import {createHashRouter, Outlet} from "react-router-dom";
import {DropFilesListener} from "../../listeners/DropFilesListener.tsx";
import ErrorView from "../ErrView.tsx";
import MosaicLayoutView from "@/components/layouts/mosaic/MosaicLayoutView.tsx";
import WindowEventListener from "@/listeners/WindowEventListener.tsx";
import AppMenuView from "@/components/menu/AppMenuView.tsx";
import AppListener from "@/listeners/AppListener.tsx";

export const router = createHashRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorView />,
    children: [
      {
        index: true,
        element: <MosaicLayoutView />,
      },
      {
        path: '/mosaic',
        element: <MosaicLayoutView />,
      },
    ]
  },
], {
  future: {
    v7_fetcherPersist: true,
  },
});

function AppLayout () {
  return (
    <>
      <AppListener />
      <DropFilesListener />
      <WindowEventListener />
      <div className="app-layout">
        <AppMenuView />
        <Outlet />
      </div>
    </>
  )
}

export default AppLayout
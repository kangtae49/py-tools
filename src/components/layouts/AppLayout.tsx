import {createHashRouter, Outlet} from "react-router-dom";
import {DropFilesListener} from "../../listeners/DropFilesListener.tsx";
import ErrorView from "../ErrView.tsx";
import {MosaicLayoutView} from "@/components/layouts/mosaic/MosaicLayoutView.tsx";
import {MenuListener} from "@/listeners/MenuListener.tsx";

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
      <MenuListener />
      <DropFilesListener />
      <Outlet />
    </>
  )
}

export default AppLayout
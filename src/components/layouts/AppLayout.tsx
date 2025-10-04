import {createHashRouter, Outlet} from "react-router-dom";
import {DropFilesListener} from "../../listeners/DropFilesListener.tsx";
import ErrorView from "../ErrView.tsx";
import {MosaicLayoutView} from "@/components/layouts/mosaic/MosaicLayoutView.tsx";

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
      <DropFilesListener />
      <Outlet />
    </>
  )
}

export default AppLayout
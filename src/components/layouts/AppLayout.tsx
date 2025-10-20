import {createHashRouter, Outlet} from "react-router-dom";
import {DropFilesListener} from "../../listeners/DropFilesListener.tsx";
import ErrorView from "../ErrView.tsx";
import MosaicLayoutView from "@/components/layouts/mosaic/MosaicLayoutView.tsx";
import {WindowEventListener} from "@/listeners/WindowEventListener.tsx";
import AppMenuView from "@/components/menu/AppMenuView.tsx";
import {useEffect, useState} from "react";

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
  const [isInitialized, setIsInitialized] = useState(false);

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

  if (!isInitialized) return null;

  return (
    <>
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
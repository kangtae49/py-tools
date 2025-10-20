import './App.css'
import {RouterProvider} from "react-router-dom";
import {router} from "./components/layouts/AppLayout.tsx";
import {useEffect, useState} from "react";
import {Toaster} from "react-hot-toast";

function App() {
  const [isInitialized, setIsinitialized] = useState(false);
  const [isPywebviewReady, setIsPywebviewReady] = useState(false);

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

  useEffect(() => {

    window.addEventListener("pywebviewready", handleReady);

    return () => {
      window.removeEventListener("pywebviewready", handleReady);
    };
  }, []);

  function handleReady() {
    console.log("pywebview is ready!");
    setIsPywebviewReady(true);
  }

  const onMount = async (signal: AbortSignal, onComplete: () => void) => {
    console.log('onMount', signal)
    await Promise.resolve();

    if(signal?.aborted) {
      console.log('onMount Aborted')
      return;
    }

    // do something
    onComplete();
    setIsinitialized(true)
    console.log('onMount Completed')
  }

  const onUnMount = async () => {
    console.log('onUnMount')
  }

  if (!isInitialized || !isPywebviewReady) return null;
  return (
    <>
      <Toaster />
        <RouterProvider router={router} />
    </>
  )
}

export default App

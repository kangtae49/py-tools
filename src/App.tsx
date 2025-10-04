import './App.css'
import {RouterProvider} from "react-router-dom";
import {router} from "./components/layouts/AppLayout.tsx";
// import MusicPlayerView from "@/components/media/music_player/MusicPlayerView.tsx";
import {useEffect, useState} from "react";

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function handleReady() {
      console.log("pywebview is ready!");
      setReady(true);
    }

    window.addEventListener("pywebviewready", handleReady);

    return () => {
      window.removeEventListener("pywebviewready", handleReady);
    };
  }, []);
  return (
    <>
      {ready ? (
        // <MusicPlayerView />
        <RouterProvider router={router} />
      ) : (
        <div>loading...</div>
      )}
      {/*<RouterProvider router={router} />*/}
    </>
  )
}

export default App

import './App.css'
import {RouterProvider} from "react-router-dom";
import {router} from "./components/layouts/AppLayout.tsx";
import {useEffect, useState} from "react";
import {Toaster} from "react-hot-toast";

function App() {
  const [isPywebviewReady, setIsPywebviewReady] = useState(false);

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

  return (
    <>
      <Toaster />
      {isPywebviewReady && <RouterProvider router={router} />}
    </>
  )
}

export default App

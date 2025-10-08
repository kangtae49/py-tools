import './App.css'
import {RouterProvider} from "react-router-dom";
import {router} from "./components/layouts/AppLayout.tsx";
import {useEffect, useState} from "react";
import {Toaster} from "react-hot-toast";

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
      <Toaster />
      {ready ? (
        <RouterProvider router={router} />
      ) : (
        <div>loading...</div>
      )}
    </>
  )
}

export default App

import {useEffect} from "react";

export function WindowEventListener() {
  useEffect(() => {
    const onWindowEventHandler = (e: CustomEvent) => {
      const event = e.detail;
      console.log("window-event:", event);
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      console.log('React app closing...');
    }

    window?.addEventListener("window-event", onWindowEventHandler as EventListener);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window?.removeEventListener("click-menu", onWindowEventHandler as EventListener);
      window?.removeEventListener("beforeunload", onBeforeUnload);
    }
  }, [])


  return null;
}

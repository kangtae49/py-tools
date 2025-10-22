import {useCallback, useEffect, useRef, useState} from "react";

type OnLoadHandler = () => void | Promise<void>;
type OnUnloadHandler = () => void | Promise<void>;

function useOnload() {
  const [ready, setReady] = useState(false);
  const onLoadHandler = useRef<OnLoadHandler>(null);
  const onUnloadHandler = useRef<OnUnloadHandler>(null);

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
    await Promise.resolve();

    if(signal?.aborted) {
      return;
    }

    onComplete();
    setReady(true)
  }

  const onUnMount = async () => {
    if (onUnloadHandler.current) {
      Promise.resolve(onUnloadHandler.current())
        .catch((err) => console.error("onUnmount error:", err)
      );
    }
  }

  useEffect(() => {
    if (ready) {
      if (onLoadHandler.current) {
        Promise.resolve(onLoadHandler.current())
          .catch((err) => console.error("onLoad error:", err)
        );
      }
    }
  }, [ready]);


  const useReadyEffect = useCallback(
    (effect: () => void | (() => void), deps: any[] = []) => {
      useEffect(() => {
        if (!ready) return;
        return effect();
      }, [ready, ...deps]);
    },
    [ready]
  );

  const onLoad = (fn: OnLoadHandler) => {
    onLoadHandler.current = fn;
  };
  const onUnload = (fn: OnUnloadHandler) => {
    onUnloadHandler.current = fn;
  };
  return {onLoad, onUnload, ready, useReadyEffect};
}

export default useOnload;
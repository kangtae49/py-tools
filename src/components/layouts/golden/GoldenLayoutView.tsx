import {useEffect} from "react";
import {GoldenLayout, LayoutConfig} from 'golden-layout'
import 'golden-layout/dist/css/goldenlayout-base.css';
import 'golden-layout/dist/css/themes/goldenlayout-dark-theme.css';
import { createRoot } from 'react-dom/client'
import {useGoldenStore} from "./useGoldenStore.ts";
import {useRef} from "react";

export function GoldenLayoutView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layoutRef = useRef<GoldenLayout | null>(null);
  const {setContainerRef, setLayoutRef} = useGoldenStore();

  useEffect(() => {
    if (containerRef?.current === null) return;

    // const config: LayoutConfig = {
    //   root: {
    //     type: "row",
    //     content: [{
    //       type: "stack",
    //       content: [{
    //         type: "component",
    //         componentType: "hello"
    //       }]
    //     }]
    //   }
    // };
    const config: LayoutConfig = {
      root: undefined,
      // root: {
      //   type: "stack",
      //   content: [{
      //     type: "component",
      //     componentType: "hello"
      //   }]
      // }
    };
    const layout = new GoldenLayout(containerRef?.current);
    layout.registerComponentFactoryFunction("hello", (container, _state) => {
      console.log("xx-view container", container);
      const root = createRoot(container.element!);
      root.render(
        <div className="hello">hello</div>,
      );
      container.on("destroy", () => {
        root.unmount();
      });
    });
    layout.loadLayout(config)
    layout.resizeWithContainerAutomatically = true;
    layoutRef.current = layout;

    setContainerRef(containerRef);
    setLayoutRef(layoutRef);



  }, [containerRef.current]);


  return (
    <div className="golden-layout"
         ref={containerRef}
    />
  )
}

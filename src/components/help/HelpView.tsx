import "./HelpView.css"
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {useEffect, useRef} from "react";
import logo from "../../assets/tr-tools.svg"
import {useAppStore} from "@/stores/useAppStore.ts";

interface Prop {
  winKey: WinKey
}

export default function HelpView({winKey: _}: Prop) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<{width: number, height: number}>({width: 0, height: 0});
  const {setFullscreenRef} = useAppStore()

  useEffect(() => {
    if(containerRef.current) {
      setFullscreenRef(containerRef.current)
    }
  }, [containerRef]);
  const randomMove = () => {
    const elements = containerRef.current?.querySelectorAll(".letter");
    elements?.forEach((el) => {
      const x = Math.random() * sizeRef.current.width - 100;
      const y = Math.random() * sizeRef.current.height - 100;
      const scale = 0.5 + Math.random() * 2.0;
      const rotate = Math.random() * 360;

      (el as HTMLElement).style.transform = `
            translate(${x}px, ${y}px) 
            scale(${scale}) 
            rotate(${rotate}deg)
          `;
    });
  }

  useEffect(() => {

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        sizeRef.current = { width, height };
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      randomMove();
    }
    const interval = setInterval(randomMove, 2000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    }
  }, [containerRef.current]);


  return (
    <div className="widget help fullscreen"
         ref={containerRef}
         tabIndex={0}
    >
      <div className="letter">
        <img src={logo} alt="logo" />
      </div>
      <div className="letter">Music</div>
      <div className="letter">Movie</div>
      <div className="letter">Picture</div>
    </div>
  )
}

import "../menu.css"
import React, {useRef, useState} from "react";
import {ControlledMenu, MenuItem, type RectElement, useHover} from "@szhsin/react-menu";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faPersonBiking} from "@fortawesome/free-solid-svg-icons";

interface Prop {
  playbackRate: number | undefined
  onChangeSpeed: (value: string) => void
}

function SpeedMenu({playbackRate, onChangeSpeed}: Prop) {
  const [isOpen, setOpen] = useState(false);
  const { anchorProps, hoverProps } = useHover(isOpen, setOpen);
  let ref = useRef<HTMLDivElement | null>(null);

  let speedNm;
  let speed = playbackRate ?? 1;
  if (speed > 1) {
    speedNm = "up";
  } else if (speed < 1) {
    speedNm = "down";
  } else {
    speedNm = "";
  }

  return (
    <div className="hover-menu">
      <div className="target" ref={ref} {...anchorProps} onClick={() => onChangeSpeed("1")}>
        <Icon icon={faPersonBiking} className={speedNm} />
      </div>
      <ControlledMenu
        {...hoverProps}
        state={isOpen ? 'open' : 'closed'}
        anchorRef={ref as React.RefObject<Element | RectElement>}
        onClose={() => setOpen(false)}
      >
        { ["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"].map((v, idx) => (
          <MenuItem key={idx} className={`menu-item ${playbackRate == Number(v) ? 'selected': ''}`} value={v} onClick={(e) => onChangeSpeed(e.value)}>x{v}</MenuItem>
        ))}
      </ControlledMenu>
    </div>
  )
}

export default SpeedMenu

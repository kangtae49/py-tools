import {faVolumeHigh, faVolumeMute} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import React, {type ChangeEvent, useRef, useState} from "react";
import {ControlledMenu, MenuItem, type RectElement, useHover} from "@szhsin/react-menu";

interface Prop {
  muted: boolean | undefined
  volume: number | undefined
  toggleMute: (e: React.MouseEvent) => void
  onChangeVolume: (e: ChangeEvent<HTMLInputElement>) => void
}

function VolumeMenu({muted, volume, toggleMute, onChangeVolume}: Prop) {
  const [isOpen, setOpen] = useState(false);
  const { anchorProps, hoverProps } = useHover(isOpen, setOpen);
  let ref = useRef<HTMLDivElement | null>(null);

  return (
    <div>
      <div ref={ref} {...anchorProps} onClick={toggleMute}>
        <Icon icon={muted ? faVolumeMute : faVolumeHigh} className={muted ? 'blink': ''}/>
      </div>
      <ControlledMenu
        {...hoverProps}
        state={isOpen ? 'open' : 'closed'}
        anchorRef={ref as React.RefObject<Element | RectElement>}
        onClose={() => setOpen(false)}
      >
        <MenuItem>
          <div className="slider">
            <input type="range" min={0} max={1} step={0.1}
                   value={volume || 0}
                   onChange={onChangeVolume}
            />
          </div>
          <div className="icon" onClick={(e) => toggleMute(e)}>
            <Icon icon={muted ? faVolumeMute : faVolumeHigh}
                  className={muted ? 'blink' : ''}/>
          </div>
        </MenuItem>
      </ControlledMenu>
    </div>
  )
}

export default VolumeMenu

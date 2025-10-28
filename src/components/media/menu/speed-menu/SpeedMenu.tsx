import "../menu.css"
import React, {useRef, useState} from "react";
import {ControlledMenu, MenuItem, type RectElement, useHover} from "@szhsin/react-menu";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faPersonBiking} from "@fortawesome/free-solid-svg-icons";

interface Prop {
  value: string | undefined
  defaultValue: string
  list: string[]
  label: (value: string) => string
  onChange: (value: string) => void
}

function SpeedMenu({value, defaultValue, list, label, onChange}: Prop) {
  const [isOpen, setOpen] = useState(false);
  const { anchorProps, hoverProps } = useHover(isOpen, setOpen);
  let ref = useRef<HTMLDivElement | null>(null);
  return (
    <div className="hover-menu badge-wrap">
      {<div className="badge-bottom" title={label(value ?? '')}>{label(value ?? '')}</div>}
      <div className="target" ref={ref} {...anchorProps} onClick={() => onChange(defaultValue)}>
        <Icon icon={faPersonBiking} />
      </div>
      <ControlledMenu
        {...hoverProps}
        state={isOpen ? 'open' : 'closed'}
        anchorRef={ref as React.RefObject<Element | RectElement>}
        onClose={() => setOpen(false)}
      >
        { list.map((v, idx) => (
          <MenuItem key={idx} className={`menu-item ${(value ?? defaultValue) == v ? 'selected': ''}`}
                    value={v}
                    onClick={(e) => onChange(e.value)}>
            {label(v)}
          </MenuItem>
        ))}
      </ControlledMenu>
    </div>
  )
}

export default SpeedMenu

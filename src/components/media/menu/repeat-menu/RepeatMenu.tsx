import "../menu.css"
import {ControlledMenu, MenuItem, type RectElement, useHover} from "@szhsin/react-menu";
import React, {type JSX, useRef, useState} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faArrowsSpin, faMinus, faRotateRight} from "@fortawesome/free-solid-svg-icons";
import type {RepeatType} from "@/components/media/useMediaStore.ts";

interface Prop {
  value: RepeatType
  defaultValue: RepeatType
  list: RepeatType[]
  label: (value: RepeatType) => string
  onChange: (value: RepeatType) => void
}

const ICONS: Record<RepeatType, JSX.Element> = {
  'repeat_all': <Icon icon={faArrowsSpin}/>,
  'repeat_one': <Icon icon={faRotateRight}/>,
  'repeat_none': <Icon icon={faMinus}/>,
}
function RepeatMenu({value, defaultValue, list, label, onChange}: Prop) {
  const [isOpen, setOpen] = useState(false);
  const { anchorProps, hoverProps } = useHover(isOpen, setOpen);
  let ref = useRef<HTMLDivElement | null>(null);


  return (
    <>
      <div className="target" ref={ref} {...anchorProps} onClick={() => onChange(defaultValue)}>
        {ICONS[value]}
      </div>
      <ControlledMenu
        {...hoverProps}
        state={isOpen ? 'open' : 'closed'}
        anchorRef={ref as React.RefObject<Element | RectElement>}
        onClose={() => setOpen(false)}
      >
        {list.map((v, idx) => (
          <MenuItem key={idx} className={`menu-item ${(value ?? defaultValue) == v ? 'selected': ''}`}
                    value={v}
                    onClick={(e) => onChange(e.value)}>
            {ICONS[v]} {label(v)}
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  )
}

export default RepeatMenu;
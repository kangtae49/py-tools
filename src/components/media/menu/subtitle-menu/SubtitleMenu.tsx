import "../menu.css"
import React, {useRef, useState} from "react";
import {ControlledMenu, MenuItem, type RectElement, useHover} from "@szhsin/react-menu";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faMessage} from "@fortawesome/free-solid-svg-icons";
import type {Sub} from "@/types/models";
import {getFilename} from "@/components/utils.ts";

interface Prop {
  subs: Sub[]
  subType: string | undefined
  onChangeSub: (value: string) => void
}

function SubtitleMenu({subs, subType, onChangeSub}: Prop) {
  const [isOpen, setOpen] = useState(false);
  const { anchorProps, hoverProps } = useHover(isOpen, setOpen);
  let ref = useRef<HTMLDivElement | null>(null);

  const titleSubType = () => {
    const sub = subs.find(v => v.subtype === subType);
    if (sub) {
      return getFilename(sub.fullpath)
    } else {
      return "-"
    }
  }

  const labelSubType = () => {
    return titleSubType() === '-' ? '-' : subType?.slice(0, 6) ?? '-'
  }

  return (
    <div className="hover-menu badge-wrap">
      {subs.length > 0 && <div className="badge">{subs.length}</div>}
      {labelSubType() !== '-' && <div className="badge-bottom" title={subType}>{labelSubType()}</div>}
      <div className="target" ref={ref} {...anchorProps}>
        <Icon icon={faMessage} className={labelSubType() === '-' ? 'inactive' : ''} />
      </div>
      <ControlledMenu
        {...hoverProps}
        state={isOpen ? 'open' : 'closed'}
        anchorRef={ref as React.RefObject<Element | RectElement>}
        onClose={() => setOpen(false)}
      >
        <MenuItem className={`menu-item ${subType === undefined ? 'selected': ''}`} value="" onClick={(e) => onChangeSub(e.value)}>-</MenuItem>
        { subs && subs.map((sub, _index) => (
          <MenuItem key={sub.fullpath}
                    className={`menu-item ${subType == sub.subtype ? 'selected': ''}`}
                    title={getFilename(sub.fullpath)}
                    value={sub.subtype}
                    onClick={(e) => onChangeSub(e.value)}
          >
            {sub.subtype}
          </MenuItem>
        ))}

      </ControlledMenu>
    </div>
  )
}

export default SubtitleMenu

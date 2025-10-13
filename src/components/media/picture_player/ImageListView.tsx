import { type CellComponentProps } from "react-window";
import React from "react";
import {srcLocal} from "@/components/utils.ts";

export type Direction = "row" | "column";

interface Prop {
  imageList: string[]
}

function ImageListView({
  columnIndex,
  rowIndex,
  style,
}: CellComponentProps<Prop>) {
  console.log('ImageListView', columnIndex, rowIndex)
  return (
    <div className="cell" style={style}>
      <img src={srcLocal("C:\\Users\\kkt\\Downloads\\pictures\\20150723_122809.jpg")} alt={`image`} />
    </div>
  )
}

export default React.memo(ImageListView);
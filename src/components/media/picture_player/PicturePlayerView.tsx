import "./PicturePlayerView.css"
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {usePictureStore} from "@/components/media/picture_player/pictureStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import {Grid} from "react-window";
import ImageListView from "./ImageListView.tsx";
import PlayListView from "@/components/media/playlist/PlayListView.tsx";
import {usePicturePlayListStore as usePlayListStore} from "@/components/media/playlist/playListStore.ts";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faImage} from "@fortawesome/free-solid-svg-icons";

interface Prop {
  winKey: WinKey
}

export default function PicturePlayerView({winKey: _}: Prop) {
  const {
    // setting,
    setContainerRef,
    // setPlayListRef,
  } = usePictureStore();

  return (
    <div className={`widget picture-player`}
         ref={setContainerRef}
    >
      <SplitPane
        split="horizontal"
        // minSize={80} primary="first"
        minSize={0} primary="second"
        defaultSize={200}
      >
        <AutoSizer>
          {({height, width}) => (
            <div className="image-view drop-image"
                 style={{width, height}}
            >
              <Grid className="image-list"
                    cellComponent={ImageListView}
                    cellProps={{imageList: []}}
                    columnCount={2}
                    columnWidth={500}
                    rowCount={2}
                    rowHeight={500}
                // listRef={setImageListRef}
                      // rowHeight={22}
                      // rowCount={10}
                      // // rowComponent={ImageListView}
                      // cellComponent={ImageListView}
                      // rowProps={{
                      //   direction: direction,
                      //   imageList: []
                      // }}
              />

              {/*<ImageView  />*/}
            </div>
          )}
        </AutoSizer>
        <AutoSizer>
          {({ height, width }) => (
            <div className="controller" style={{width, height}}>
              <div className="top">
                <div className="row first">
                </div>
                <div className="drop-list"
                     style={{ minHeight: "100%", height: "calc(100% - 85px)", width }}
                     // onDrop={(e) => setDropRef(e.currentTarget as HTMLDivElement)}
                >
                  <PlayListView
                    usePlayListStore={usePlayListStore}
                    icon={<Icon icon={faImage} />}
                  />
                </div>
              </div>
            </div>
          )}
        </AutoSizer>

      </SplitPane>
    </div>
  )
}
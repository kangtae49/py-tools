import "./PicturePlayerView.css"
import type {WinKey} from "@/components/layouts/mosaic/mosaicStore.ts";
import {usePictureStore} from "@/components/media/picture_player/pictureStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import AutoSizer from "react-virtualized-auto-sizer";
import {List, Grid} from "react-window";
import PicturePlayListRowView from "./PicturePlayListRowView.tsx";
import ImageListView from "./ImageListView.tsx";

interface Prop {
  winKey: WinKey
}

export default function PicturePlayerView({winKey: _}: Prop) {
  const {
    setting,
    setContainerRef,
    setPlayListRef,
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
                <div className="row second">
                </div>
                <div className="play-list-con drop-list"
                     style={{ height: "calc(100% - 105px)", width }}
                >
                  <List className="play-list"
                        listRef={setPlayListRef}
                        rowHeight={22}
                        rowCount={setting.playList?.length ?? 0}
                        rowComponent={PicturePlayListRowView}
                        rowProps={{ playList: setting.playList ?? []}}
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
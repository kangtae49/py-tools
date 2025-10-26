import {Swiper, SwiperSlide} from "swiper/react"
import {Autoplay} from "swiper/modules";
import "swiper/swiper.css";
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import type {UsePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";
import React from "react";
import {getFilename, srcLocal} from "@/components/utils.ts";
import {usePictureStore} from "@/components/media/picture-player/usePictureStore.ts";

interface Prop {
  usePlayListStore: UseBoundStore<StoreApi<UsePlayListStore>>
  icon?: React.ReactElement
  width: number
  height: number
}

function SwiperView({
  usePlayListStore,
  icon: _,
  width,
  height,
}: Prop) {
  const {setting} = usePictureStore();
  const {playList} = usePlayListStore();

  return (
    <div className="swiper-view"
         style={{width: width, height: height}}
    >
      <Swiper
        modules={[
          Autoplay,
        ]}
        effect={"fade"}
        centeredSlides={true}
        autoplay={{
            delay: setting.playbackRate * 1000,
        }}
        loop={true}
        slidesPerView={1}
      >
        {playList.map((playPath: string, idx: number) => (
          <SwiperSlide key={idx}>
            <img src={srcLocal(playPath)}
                 loading="lazy"
                 alt={getFilename(playPath)}
            />
          </SwiperSlide>
        ))}

      </Swiper>

    </div>
  )
}

export default SwiperView

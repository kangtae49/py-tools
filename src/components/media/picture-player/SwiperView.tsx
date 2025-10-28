import {Swiper, type SwiperRef, SwiperSlide} from "swiper/react"
import {Autoplay, EffectFade} from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/swiper.css";
import "swiper/swiper-bundle.css"
import type {UseBoundStore} from "zustand";
import type {StoreApi} from "zustand/vanilla";
import type {UsePlayListStore} from "@/components/media/play-list/usePlayListStore.ts";
import React, {useRef} from "react";
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
  const {setting, setSetting} = usePictureStore();
  const swiperRef = useRef<SwiperRef>(null);
  const {setViewType} = usePictureStore();
  const {
    playList, setPlayList,
    setPlayPath,
  } = usePlayListStore();


  const onSlideChange = (swiper: SwiperType) => {
    console.log("swiper index", swiper.realIndex);
    setPlayPath(playList[swiper.realIndex])
  };

  const onSlideChangeTransitionEnd = (swiper: SwiperType) => {
    console.log("swiper end", swiper.isEnd);
    const {setting} = usePictureStore.getState()
    console.log(setting.repeat)
    if (!swiper.isEnd) return;
    if (setting.repeat === 'repeat_all') {
      const {shuffle, shufflePlayList} = usePlayListStore.getState()
      if (shuffle) {
        const shuffledPlayList = shufflePlayList(playList);
        setPlayList(shuffledPlayList)
      }
      setTimeout(() => {
        swiper.slideTo(0);
      }, setting.playbackRate);
    } else {
      setSetting((setting) => ({...setting, paused: true}))
      setViewType('single')
    }
  };

  const onClickImage = (_playPath: string) => {

  }

  return (
    <div className="swiper-view"
         style={{width: width, height: height}}
    >
      <Swiper
        ref={(swiper) => {swiperRef.current = swiper}}
        modules={[
          Autoplay,
          EffectFade,
        ]}
        effect={"fade"}
        fadeEffect={{ crossFade: true }}
        centeredSlides={true}
        speed={setting.playbackRate * 1000}
        autoplay={{
          delay: setting.playbackRate * 1000,
          disableOnInteraction: false,
          stopOnLastSlide: true,
        }}
        // loop={false}
        slidesPerView={1}
        onSlideChange={onSlideChange}
        onSlideChangeTransitionEnd={onSlideChangeTransitionEnd}

      >
        {playList.map((playPath: string, idx: number) => (
          <SwiperSlide key={idx} onClick={() => onClickImage(playPath)}>
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

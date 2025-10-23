"use client"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"

export default function SwiperDisplay({ slides }: { slides: { src: string; caption?: string }[] }) {
  return (
    <Swiper spaceBetween={10} slidesPerView={1}>
      {slides.map((slide, i) => (
        <SwiperSlide key={i}>
          <img src={slide.src} alt={slide.caption || ""} className="w-full rounded-xl" />
          {slide.caption && <p className="text-sm text-center mt-1">{slide.caption}</p>}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

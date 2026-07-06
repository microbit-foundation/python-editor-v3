/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, SystemStyleObject } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import "swiper/css/a11y";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { A11y, Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperProps, SwiperSlide } from "swiper/react";
import SwiperCarouselButtons from "./SwiperCarouselButtons";

interface SwiperCarouselProps extends SwiperProps {
  carouselItems: JSX.Element[];
  containerMessageId: string;
  padding?: string | number;
  slideClassName?: string;
  swiperWrapperClassName?: string;
  sx?: SystemStyleObject;
}

const swiperModules = [A11y, Autoplay, Navigation, Pagination];

const SwiperCarousel = ({
  carouselItems,
  containerMessageId,
  padding,
  navigation,
  slideClassName,
  swiperWrapperClassName,
  sx: sxProp,
  ...props
}: SwiperCarouselProps) => {
  const intl = useIntl();
  const isRtl = false;
  const [swiper, setSwiper] = useState<SwiperClass>();
  const handleSlideFocus = useCallback(
    (e: React.FocusEvent<HTMLElement, Element>) => {
      if (swiper) {
        swiper.slides.forEach((slide, i) => {
          if (slide.contains(e.target)) {
            swiper.activeIndex = i;
            swiper.updateSlidesClasses();
            swiper.slideTo(i);
          }
        });
      }
    },
    [swiper]
  );

  const handleSwiper = useCallback((swiper: SwiperClass) => {
    setSwiper(swiper);
    swiper.update();
  }, []);

  return (
    <Box
      display="grid"
      overflow="hidden"
      sx={{
        "--swiper-theme-color": "black",
        "--swiper-navigation-size": "50",
        "& ul": { margin: 0 },
        "& .swiper-slide": {
          transform: "translate3d(0, 0, 0) translateZ(0) !important",
          width: "unset",
        },
        ...sxProp,
      }}
    >
      <Swiper
        onSwiper={handleSwiper}
        style={{
          ...(padding !== undefined && { padding }),
          alignItems: "stretch",
        }}
        dir={isRtl ? "rtl" : "ltr"}
        a11y={{
          enabled: true,
          slideRole: "presentation",
          containerRoleDescriptionMessage: intl.formatMessage({
            id: "carousel-role",
          }),
          itemRoleDescriptionMessage: intl.formatMessage({
            id: "carousel-slide-role",
          }),
          containerMessage: intl.formatMessage({ id: containerMessageId }),
          slideLabelMessage: intl.formatMessage(
            { id: "carousel-slide-label" },
            {
              slideNum: "{{index}}",
              totalSlides: "{{slidesLength}}",
            }
          ),
        }}
        modules={swiperModules}
        tag="ul"
        watchSlidesProgress
        wrapperClass={swiperWrapperClassName}
        {...props}
      >
        {navigation && <SwiperCarouselButtons />}
        {carouselItems.map((item) => (
          <SwiperSlide
            key={item.key}
            className={slideClassName}
            onFocus={handleSlideFocus}
            tag="li"
          >
            {item}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default SwiperCarousel;

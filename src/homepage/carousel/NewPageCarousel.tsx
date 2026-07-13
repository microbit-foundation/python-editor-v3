/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useMemo } from "react";
import { SwiperClass } from "swiper/react";
import SwiperCarousel from "./SwiperCarousel";

const fast = 1000;
const cardWidth = 260;
const mobileSpaceBetween = 15;

interface NewPageCarouselProps {
  carouselItems: JSX.Element[];
  containerMessageId: string;
}

const NewPageCarousel = ({
  carouselItems,
  containerMessageId,
}: NewPageCarouselProps) => {
  const getSlidesPerGroup = useCallback((spacing: number) => {
    // --carousel-px is 20px at md+ where this calculation is used.
    return Math.max(
      1,
      Math.floor((window.innerWidth - 40) / (cardWidth + spacing))
    );
  }, []);

  const breakpoints = useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }

    return {
      // When window width is >= 0px.
      0: {
        spaceBetween: mobileSpaceBetween,
        slidesPerGroup: 1,
      },
      // When window width is >= 768px.
      768: {
        spaceBetween: 20,
        slidesPerGroup: getSlidesPerGroup(20),
      },
      // When window width is >= 992px.
      992: {
        spaceBetween: 25,
        slidesPerGroup: getSlidesPerGroup(25),
      },
      // When window width is >= 1200px.
      1200: {
        spaceBetween: 30,
        slidesPerGroup: getSlidesPerGroup(30),
      },
      // When window width is >= 1400px.
      1400: {
        spaceBetween: 30,
        slidesPerGroup: getSlidesPerGroup(30),
      },
    };
  }, [getSlidesPerGroup]);

  const getBreakpoint = useCallback(() => {
    if (typeof window !== "undefined" && breakpoints) {
      if (window.innerWidth < 768) {
        return breakpoints[0];
      } else if (window.innerWidth < 992) {
        return breakpoints[768];
      } else if (window.innerWidth < 1200) {
        return breakpoints[992];
      } else if (window.innerWidth < 1400) {
        return breakpoints[1200];
      } else {
        return breakpoints[1400];
      }
    }
  }, [breakpoints]);

  const recalculateBreakpoints = useCallback(
    (swiper: SwiperClass) => {
      if (typeof window === "undefined") {
        return;
      }
      const breakpoint = getBreakpoint();
      if (breakpoint) {
        let slidesPerGroup = breakpoint.slidesPerGroup;
        if (breakpoint.spaceBetween !== mobileSpaceBetween) {
          slidesPerGroup = getSlidesPerGroup(breakpoint.spaceBetween);
        }
        swiper.params.slidesPerGroup = slidesPerGroup;
      }
    },
    [getBreakpoint, getSlidesPerGroup]
  );

  return (
    <SwiperCarousel
      autoplay={false}
      breakpoints={breakpoints}
      slidesPerView="auto"
      carouselItems={carouselItems}
      containerMessageId={containerMessageId}
      navigation={true}
      onResize={recalculateBreakpoints}
      onInit={recalculateBreakpoints}
      speed={fast}
      sx={{
        "--carousel-px": { base: "12px", md: "20px" },
        "--carousel-pt": "1rem",
        "--carousel-pb": "12px",
        "& li > div": { height: "100%", width: "260px" },
        "& .swiper": {
          padding: "var(--carousel-pt) var(--carousel-px) var(--carousel-pb)",
        },
      }}
    />
  );
};
export default NewPageCarousel;

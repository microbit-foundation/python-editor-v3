/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useSwiper } from "swiper/react";
import CarouselButton from "./CarouselButton";

const buttonStyles = {
  position: "absolute" as const,
  zIndex: 5,
  top: "var(--carousel-pt)",
  // Draw over the box shadow below the carousel cards
  bottom: "calc(var(--carousel-pb) - 8px)",
};

const SwiperCarouselButtons = () => {
  const isRtl = false;
  const swiper = useSwiper();
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!swiper.destroyed && prevButtonRef.current && nextButtonRef.current) {
      swiper.navigation.prevEl = prevButtonRef.current;
      swiper.navigation.nextEl = nextButtonRef.current;
      swiper.navigation.update();
      (swiper.navigation.nextEl as HTMLElement).tabIndex = -1;
      (swiper.navigation.prevEl as HTMLElement).tabIndex = -1;
    }
  }, [swiper.destroyed, swiper.navigation]);

  // Override tab index on buttons. These are useless for keyboard users.
  // Just tab through the slide items/cards instead.
  useEffect(() => {
    const listener = () => {
      (swiper.navigation.nextEl as HTMLElement).tabIndex = -1;
      (swiper.navigation.prevEl as HTMLElement).tabIndex = -1;
    };
    if (!swiper.destroyed) {
      swiper.on("activeIndexChange", listener);
    }
    return () => {
      if (!swiper.destroyed) {
        swiper.off("activeIndexChange", listener);
      }
    };
  }, [swiper]);

  return (
    <Box
      display={["none", null, "contents"]}
      sx={{
        "& .swiper-button-disabled": { display: "none" },
      }}
    >
      <CarouselButton
        ref={prevButtonRef}
        aria-hidden="true"
        {...buttonStyles}
        left={isRtl ? undefined : 0}
        right={isRtl ? 0 : undefined}
        direction={isRtl ? "right" : "left"}
        onClick={() => swiper.slidePrev()}
      />
      <CarouselButton
        ref={nextButtonRef}
        aria-hidden="true"
        {...buttonStyles}
        left={isRtl ? 0 : undefined}
        right={isRtl ? undefined : 0}
        direction={isRtl ? "left" : "right"}
        onClick={() => swiper.slideNext()}
      />
    </Box>
  );
};

export default SwiperCarouselButtons;

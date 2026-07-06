/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/react";
import React from "react";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";
import ChevronRightIcon from "../icons/ChevronRightIcon";

interface CarouselButtonProps extends BoxProps {
  direction: "left" | "right";
  onClick?: () => void;
  stroke?: string;
}

const CarouselButton = React.forwardRef(function CarouselButton(
  { direction, onClick, stroke, ...rest }: CarouselButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <Box
      as="button"
      ref={ref}
      type="button"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={0}
      border="none"
      borderRadius={0}
      bg="rgba(245, 245, 245, 0.5)"
      cursor="pointer"
      transition="background-color 0.2s ease"
      w="60px"
      _hover={{
        bg: "rgb(245, 245, 245)",
        "& svg": { transform: "scale(1.2)" },
      }}
      _focusVisible={{
        outline: "none",
        boxShadow: "0 0 0 4px rgba(66, 153, 225, 0.6)",
      }}
      sx={{
        "& svg": {
          objectFit: "contain",
          transition: "transform 0.2s ease",
          w: "30px",
          h: "30px",
          mr: direction === "left" ? "3px" : undefined,
          ml: direction === "right" ? "3px" : undefined,
        },
      }}
      onClick={onClick}
      {...rest}
    >
      {direction === "left" ? (
        <ChevronLeftIcon stroke={stroke} />
      ) : (
        <ChevronRightIcon stroke={stroke} />
      )}
    </Box>
  );
});

export default CarouselButton;

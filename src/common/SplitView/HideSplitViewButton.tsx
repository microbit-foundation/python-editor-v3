/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon } from "@microbit/ui";
import React, { ForwardedRef } from "react";
import { RiDownloadLine } from "react-icons/ri";
import { Box } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import CollapsibleButton from "../CollapsibleButton";

interface HideSplitViewButtonProps {
  "aria-label": string;
  onClick: () => void;
  direction: "expandLeft" | "expandRight";
  splitViewShown: boolean;
  text?: string;
  css?: SystemStyleObject;
}

const HideSplitViewButton = React.forwardRef(
  (
    {
      onClick,
      direction,
      splitViewShown,
      text = "",
      css: cssProp,
      ...props
    }: HideSplitViewButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const mode = text ? "button" : "icon";
    const expanded =
      (direction === "expandRight" && splitViewShown) ||
      (direction === "expandLeft" && !splitViewShown);
    return (
      <Box position="relative">
        {/* Hack to cover divider box shadow on right hand side. */}
        {direction === "expandLeft" && splitViewShown && (
          <Box
            width="10px"
            height="60px"
            background="#eaecf1"
            zIndex={5}
            position="absolute"
            left="-10px"
            top="-10px"
            pointerEvents="none"
          />
        )}
        <CollapsibleButton
          ref={ref}
          mode={mode}
          text={text}
          icon={
            <Icon
              as={RiDownloadLine}
              css={{
                transform: expanded ? "rotate(90deg)" : "rotate(270deg)",
              }}
            />
          }
          onPress={onClick}
          size="md"
          variant="ghost"
          css={{
            fontSize: "lg",
            transition: "none",
            borderTopRightRadius: expanded ? "0" : "6px",
            borderBottomRightRadius: expanded ? "0" : "6px",
            borderTopLeftRadius: expanded ? "6px" : "0",
            borderBottomLeftRadius: expanded ? "6px" : "0",
            py: "3",
            borderColor: "black",
            minW: "unset",
            width: mode === "icon" ? "20px" : "auto",
            background: "#eaecf1",
            // The flat background is a utility, which beats the ghost
            // variant's recipe-layer hover/active — restate them (Chakra's
            // ghost-over-gray values).
            _hover: { background: "gray.100" },
            _active: { background: "gray.200" },
            // Likewise a flat boxShadow from a call site (e.g. Simulator's
            // md shadow) beats the recipe-layer focus ring — restate it.
            _focusVisible: { focusShadow: "outline" },
            color: "brand.500",
            zIndex: "splitViewHideButton",
            ...cssProp,
          }}
          {...props}
        />
      </Box>
    );
  }
);

export default HideSplitViewButton;

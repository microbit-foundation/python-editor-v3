/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Icon, IconButtonProps } from "@chakra-ui/react";
import { RiDownloadLine } from "react-icons/ri";
import CollapsibleButton from "../CollapsibleButton";
import { splitViewHideButton } from "../zIndex";

interface HideSplitViewButtonProps extends IconButtonProps {
  handleClick: () => void;
  direction: "expandLeft" | "expandRight";
  splitViewShown: boolean;
  text?: string;
}

const HideSplitViewButton = ({
  handleClick,
  direction,
  splitViewShown,
  text = "",
  ...props
}: HideSplitViewButtonProps) => {
  const mode = text ? "button" : "icon";
  let rightBorderRadius = 6;
  let leftBorderRadius = 0;
  let rotation = "rotate(270deg)";
  if (
    (direction === "expandRight" && splitViewShown) ||
    (direction === "expandLeft" && !splitViewShown)
  ) {
    rightBorderRadius = 0;
    leftBorderRadius = 6;
    rotation = "rotate(90deg)";
  }
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
        mode={mode}
        text={text}
        icon={<Icon as={RiDownloadLine} transform={rotation} />}
        fontSize="lg"
        transition="none"
        onClick={handleClick}
        borderTopRightRadius={rightBorderRadius}
        borderBottomRightRadius={rightBorderRadius}
        borderTopLeftRadius={leftBorderRadius}
        borderBottomLeftRadius={leftBorderRadius}
        py={3}
        borderColor="black"
        size="md"
        minW="unset"
        width={mode === "icon" ? "20px" : "auto"}
        background="#eaecf1"
        color="brand.500"
        variant="ghost"
        zIndex={splitViewHideButton}
        boxShadow={direction === "expandLeft" ? "md" : "none"}
        {...props}
      />
    </Box>
  );
};
export default HideSplitViewButton;

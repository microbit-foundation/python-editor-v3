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
  direction: "left" | "right";
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
    (direction === "right" && splitViewShown) ||
    (direction === "left" && !splitViewShown)
  ) {
    rightBorderRadius = 0;
    leftBorderRadius = 6;
    rotation = "rotate(90deg)";
  }
  return (
    <Box position="relative">
      {/* Hack to cover divider box shadow on right hand side. */}
      {direction === "left" && splitViewShown && (
        <Box
          width="10px"
          height="50px"
          background="#eaecf1"
          zIndex={5}
          position="absolute"
          left="-10px"
          top="-5px"
        />
      )}
      <CollapsibleButton
        mode={text ? "button" : "icon"}
        text={text}
        icon={<Icon as={RiDownloadLine} transform={rotation} />}
        fontSize="xl"
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
        boxShadow="md"
        {...props}
      />
    </Box>
  );
};
export default HideSplitViewButton;

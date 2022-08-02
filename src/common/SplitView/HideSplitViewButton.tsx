/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { RiDownloadLine } from "react-icons/ri";

interface HideSplitViewButtonProps extends IconButtonProps {
  handleClick: () => void;
  direction: "left" | "right";
}

const HideSplitViewButton = ({
  handleClick,
  direction,
  ...props
}: HideSplitViewButtonProps) => {
  const deg = direction === "left" ? "90deg" : "270deg";
  return (
    <IconButton
      borderTopLeftRadius={0}
      borderTopRightRadius={0}
      borderBottomRightRadius={6}
      borderBottomLeftRadius={6}
      transition="none"
      size="sm"
      height="20px"
      width="50px"
      background="#eaecf1"
      color="brand.500"
      variant="ghost"
      bgColor="gray.200"
      icon={<RiDownloadLine />}
      position="absolute"
      top="50%"
      transform={`translateY(-50%) rotate(${deg})`}
      onClick={handleClick}
      {...props}
    />
  );
};

export default HideSplitViewButton;

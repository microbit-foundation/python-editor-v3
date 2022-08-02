/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton, IconButtonProps, Portal } from "@chakra-ui/react";
import { useRef } from "react";
import { RiDownloadLine } from "react-icons/ri";
import { ReactComponent as FaceIcon } from "../../editor/microbit-face-icon.svg";

interface HideSplitViewButtonProps extends IconButtonProps {
  handleClick: () => void;
  direction: "left" | "right";
  simulatorButton?: boolean;
  simulatorShown?: boolean;
  handleShowSimulator?: () => void;
}

const HideSplitViewButton = ({
  handleClick,
  direction,
  simulatorButton = false,
  simulatorShown = false,
  handleShowSimulator,
  ...props
}: HideSplitViewButtonProps) => {
  const deg = direction === "left" ? "90deg" : "270deg";
  const ref = useRef<HTMLButtonElement>(null);
  const topAdjust = 5;
  const top = ref.current?.getBoundingClientRect().top || 0;
  return (
    <>
      {simulatorButton && !simulatorShown && (
        <Portal>
          <IconButton
            size="md"
            variant="solid"
            aria-label="Show simulator"
            position="absolute"
            borderTopLeftRadius={10}
            borderTopRightRadius={0}
            borderBottomRightRadius={0}
            borderBottomLeftRadius={10}
            p={1.5}
            icon={<FaceIcon />}
            transition="none"
            top={top + topAdjust + "px"}
            right={0}
            onClick={handleShowSimulator ? handleShowSimulator : () => {}}
            width="30px"
            zIndex={5}
          />
        </Portal>
      )}
      <IconButton
        ref={ref}
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
    </>
  );
};

export default HideSplitViewButton;

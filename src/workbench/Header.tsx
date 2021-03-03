import { Flex, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import GradientLine from "../common/GradientLine";
import { ConnectionStatus } from "../device";
import { useConnectionStatus } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import HelpMenu from "./HelpMenu";
import Logo from "./Logo";
import OpenButton from "./OpenButton";
import ProjectNameEditable from "./ProjectNameEditable";
import ShareButton from "./ShareButton";
import ZoomControls from "./ZoomControls";

/**
 * The header area with associated actions.
 */
const Header = () => {
  const status = useConnectionStatus();
  const supported = status !== ConnectionStatus.NOT_SUPPORTED;
  const size = "md";
  return (
    <VStack
      spacing={0}
      align="start"
      alignContent="space-between"
      flex="0 0 auto"
    >
      <Flex width="100%" justifyContent="space-between" padding={2}>
        <HStack spacing={5} marginRight={8}>
          <Logo height="28px" />
          <HStack spacing={3}>
            <ProjectNameEditable />
            <ShareButton size={size} />
          </HStack>
        </HStack>
        <HStack spacing={3} as="nav">
          <OpenButton size={size}>Open</OpenButton>
          {/* otherwise we put it where flash usually goes */}
          {supported && <DownloadButton size={size} />}
          <HelpMenu size={size} />
        </HStack>
      </Flex>
      <GradientLine />
    </VStack>
  );
};

export default Header;

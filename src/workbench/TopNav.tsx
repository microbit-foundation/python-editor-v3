import { Button, Flex, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import { RiInformationLine } from "react-icons/ri";
import GradientLine from "../common/GradientLine";
import { ConnectionStatus } from "../device";
import { useConnectionStatus, useDevice } from "../device/device-hooks";
import DownloadButton from "./DownloadButton";
import { ReactComponent as Logo } from "./logo.svg";
import ProjectNameEditable from "./ProjectNameEditable";
import ZoomControls from "./ZoomControls";

const TopNav = () => {
  const status = useConnectionStatus();
  const supported = status !== ConnectionStatus.NOT_SUPPORTED;
  return (
    <VStack
      spacing={0}
      align="start"
      alignContent="space-between"
      flex="0 0 auto"
    >
      <Flex width="100%" justifyContent="space-between" padding={2}>
        <HStack spacing={5} marginRight={8}>
          <Logo height="30px" />
          <ProjectNameEditable />
        </HStack>
        <HStack spacing={8}>
          {/* otherwise we put it where flash usually goes */}
          {supported && (
            <HStack as="nav">
              <DownloadButton />
            </HStack>
          )}
          <ZoomControls />
          <HStack>
            <Button leftIcon={<RiInformationLine />} variant="ghost" size="lg">
              Help
            </Button>
          </HStack>
        </HStack>
      </Flex>
      <GradientLine />
    </VStack>
  );
};

export default TopNav;

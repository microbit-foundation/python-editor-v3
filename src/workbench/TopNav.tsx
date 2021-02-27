import { Button, Flex, HStack, useToast, VStack } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { RiDownload2Line, RiInformationLine } from "react-icons/ri";
import GradientLine from "../common/GradientLine";
import { useFileSystem } from "../fs/fs-hooks";
import { ReactComponent as Logo } from "./logo.svg";
import ProjectNameEditable from "./ProjectNameEditable";
import ZoomControls from "./ZoomControls";

const TopNav = () => {
  const fs = useFileSystem();
  const toast = useToast();
  const handleDownload = useCallback(async () => {
    let hex: string | undefined;
    try {
      hex = await fs.toHexForDownload();
    } catch (e) {
      toast({
        title: "Failed to build the hex file",
        status: "error",
        description: e.message,
        position: "top",
        isClosable: true,
      });
      return;
    }
    // TODO: wire up project name
    const projectName = "my-script";
    const blob = new Blob([hex], { type: "application/octet-stream" })
    saveAs(blob, `${projectName}.hex`);
  }, []);
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
          <HStack as="nav">
            <Button
              size="lg"
              leftIcon={<RiDownload2Line />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </HStack>
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

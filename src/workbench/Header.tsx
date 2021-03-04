import { Flex, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import DeviceConnection from "./DeviceConnection";
import HelpMenu from "./HelpMenu";
import Logo from "./Logo";
import OpenButton from "./OpenButton";
import ProjectNameEditable from "./ProjectNameEditable";
import ShareButton from "./ShareButton";

/**
 * The header area with associated actions.
 */
const Header = () => {
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
          <DeviceConnection />
          <HelpMenu size={size} />
        </HStack>
      </Flex>
    </VStack>
  );
};

export default Header;

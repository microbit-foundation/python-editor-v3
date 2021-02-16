import {
  Button,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import GradientLine from "../common/GradientLine";
import { ReactComponent as Logo } from "./logo.svg";
import {
  RiDownload2Line,
  RiInformationLine,
  RiZoomInLine,
  RiZoomOutLine,
} from "react-icons/ri";
import ProjectNameEditable from "./ProjectNameEditable";

const TopNav = () => {
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
            <Menu placement="bottom">
              <MenuButton as={Button} size="lg" leftIcon={<RiDownload2Line />}>
                Download
              </MenuButton>
              <Portal>
                <MenuList zIndex={43}>
                  <MenuItem>HEX file</MenuItem>
                  <MenuItem>Python script</MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </HStack>
          <HStack as="nav">
            <IconButton
              size="lg"
              isRound
              icon={<RiZoomOutLine />}
              aria-label="Zoom out"
            />
            <IconButton
              size="lg"
              isRound
              icon={<RiZoomInLine />}
              aria-label="Zoom in"
            />
          </HStack>
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

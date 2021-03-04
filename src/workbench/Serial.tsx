import { Flex, HStack, VStack } from "@chakra-ui/react";
import React from "react";
import Placeholder from "../common/Placeholder";
import DeviceConnection from "./DeviceConnection";
import ProjectNameEditable from "./ProjectNameEditable";

const Serial = () => {
  return (
    <Flex flexDirection="column" alignItems="stretch" height="100%">
      <HStack justifyContent="space-between" padding={1}>
        <ProjectNameEditable />
        <DeviceConnection />
      </HStack>
      <Placeholder
        flex="1 1 auto"
        backgroundColor="blackAlpha.900"
        color="white"
        text="Serial here, showing errors from your micro:bit when you run the code"
      />
    </Flex>
  );
};

export default Serial;

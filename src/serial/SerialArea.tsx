import { Flex } from "@chakra-ui/react";
import React from "react";
import Placeholder from "../common/Placeholder";
import ProjectActionBar from "../project/ProjectActionBar";

const SerialArea = () => {
  return (
    <Flex flexDirection="column" alignItems="stretch" height="100%">
      <ProjectActionBar mt={1} mb={1} ml={2} mr={2} />
      <Placeholder
        flex="1 1 auto"
        backgroundColor="blackAlpha.900"
        color="white"
        text="Serial here, showing errors from your micro:bit when you run the code"
      />
    </Flex>
  );
};

export default SerialArea;

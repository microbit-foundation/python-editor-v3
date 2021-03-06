import { Flex } from "@chakra-ui/react";
import React from "react";
import ProjectActionBar from "../project/ProjectActionBar";
import XTerm from "./XTerm";

const SerialArea = () => {
  return (
    <Flex flexDirection="column" alignItems="stretch" height="100%">
      <ProjectActionBar mt={1} mb={1} ml={2} mr={2} />
      <XTerm />
    </Flex>
  );
};

export default SerialArea;

import { Center, Text } from "@chakra-ui/react";
import React from "react";

/**
 * Not a simulator!
 */
const SimulatorArea = () => {
  return (
    <>
      <img
        style={{ width: "100%" }}
        src="https://user-images.githubusercontent.com/44397098/109841157-af8df780-7c40-11eb-964f-8820206d0dbd.png"
      />
      <Center>
        <Text width="20ch" textAlign="center">
          Just a screenshot of a simulator as a placeholder!
        </Text>
      </Center>
    </>
  );
};

export default SimulatorArea;

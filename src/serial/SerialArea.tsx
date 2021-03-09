import { Flex } from "@chakra-ui/react";
import Placeholder from "../common/Placeholder";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import ProjectActionBar from "../project/ProjectActionBar";
import XTerm from "./XTerm";

const SerialArea = () => {
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  return (
    <Flex flexDirection="column" alignItems="stretch" height="100%">
      <ProjectActionBar mt={1} mb={1} ml={2} mr={2} />
      {connected ? (
        <XTerm flex="1 1 auto" height={0} />
      ) : (
        <Placeholder
          flex="1 1 auto"
          backgroundColor="black"
          color="white"
          text="Connect via WebUSB to see serial output from your micro:bit here"
        />
      )}
    </Flex>
  );
};

export default SerialArea;

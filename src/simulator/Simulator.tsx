import { AspectRatio, Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { useRef } from "react";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import Sensors from "./Sensors";
import { useSimulator } from "./simulator-hooks";

const Simulator = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { play, stop, sensors, onSensorChange } = useSimulator(ref);
  return (
    <VStack spacing={5} height="100%" bg="gray.25">
      <Box width="100%" boxShadow="lg" pb={2}>
        <AspectRatio ratio={191.27 / 155.77} width="100%">
          <Box
            ref={ref}
            as="iframe"
            // This needs changing before we remove the flag.
            src="https://stage-python-simulator.microbit.org/simulator.html"
            title="Simulator"
            frameBorder="no"
            scrolling="no"
            allow="autoplay;microphone"
          />
        </AspectRatio>
        <HStack justifyContent="center">
          <IconButton
            variant="solid"
            onClick={play}
            icon={<RiPlayFill />}
            aria-label="Run"
          />
          <IconButton
            variant="outline"
            onClick={stop}
            icon={<RiStopFill />}
            aria-label="Stop"
          />
        </HStack>
      </Box>
      <Sensors
        value={sensors}
        flex="1 1 auto"
        onSensorChange={onSensorChange}
      />
    </VStack>
  );
};

export default Simulator;

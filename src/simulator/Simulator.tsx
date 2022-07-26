import { AspectRatio, Box, HStack, IconButton, VStack } from "@chakra-ui/react";
import { useRef } from "react";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import Sensors from "./Sensors";
import { useSimulator } from "./simulator-hooks";

const Simulator = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { play, stop, sensors, onSensorChange } = useSimulator(ref);
  return (
    <VStack spacing={5}>
      <Box width="100%">
        <AspectRatio ratio={400 / 321} width="100%">
          <Box
            ref={ref}
            as="iframe"
            // This needs changing before we remove the flag.
            src="https://stage-python-simulator.microbit.org/simulator.html"
            title="Simulator"
            frameBorder="no"
            scrolling="no"
          />
        </AspectRatio>
        {/* Margin hack until we remove space from iframe */}
        <HStack justifyContent="center" mt={-2}>
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

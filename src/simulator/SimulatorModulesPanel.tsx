/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, VStack } from "@chakra-ui/react";
import { RunningStatus } from "./Simulator";
import SimulatorModules from "./SimulatorModules";

interface SimulatorModulesPanelProps {
  simRunning: RunningStatus;
}

/**
 * The lower part of the simulator: the sensor/input modules.
 *
 * The serial REPL used to live here too, but now shares the panel next to
 * the editor (see {@link SerialPanel}), so this is just the modules.
 */
const SimulatorModulesPanel = ({ simRunning }: SimulatorModulesPanelProps) => {
  return (
    <Box flex="1 1 auto" minHeight={0} overflowY="auto" bg="gray.25">
      <VStack spacing={5} align="stretch" height="100%">
        <SimulatorModules flex="1 1 auto" running={simRunning} />
      </VStack>
    </Box>
  );
};

export default SimulatorModulesPanel;

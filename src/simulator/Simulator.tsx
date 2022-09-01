/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { AspectRatio, Box, Flex, useToken, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { IntlShape, useIntl } from "react-intl";
import HideSplitViewButton from "../common/SplitView/HideSplitViewButton";
import { useResizeObserverContentRect } from "../common/use-resize-observer";
import { topBarHeight } from "../deployment/misc";
import { DeviceContextProvider } from "../device/device-hooks";
import { SimulatorDeviceConnection } from "../device/simulator";
import SimulatorActionBar from "./SimulatorActionBar";
import SimulatorSplitView from "./SimulatorSplitView";

export enum RunningStatus {
  RUNNING,
  STOPPED,
}

interface SimulatorProps {
  shown: boolean;
  onSimulatorHide: () => void;
  showSimulatorButtonRef: React.RefObject<HTMLButtonElement>;
  minWidth: number;
}

const Simulator = ({
  shown,
  onSimulatorHide,
  showSimulatorButtonRef,
  minWidth,
}: SimulatorProps) => {
  // This needs the domain to be updated before we release.
  const url = "https://stage-python-simulator.microbit.org/simulator.html";
  // For testing with sim branches:
  //const branch = "whatever";
  //const url = `https://review-python-simulator.microbit.org/${branch}/simulator.html`;

  const ref = useRef<HTMLIFrameElement>(null);
  const intl = useIntl();
  const simulatorTitle = intl.formatMessage({ id: "simulator-title" });
  const simulator = useRef(
    new SimulatorDeviceConnection(() => {
      return ref.current;
    })
  );
  useEffect(() => {
    const sim = simulator.current;
    sim.initialize();
    return () => {
      sim.dispose();
    };
  }, []);
  useEffect(() => {
    updateTranslations(simulator.current, intl);
  }, [simulator, intl]);
  const simControlsRef = useRef<HTMLDivElement>(null);
  const contentRect = useResizeObserverContentRect(simControlsRef);
  const simHeight = contentRect?.height ?? 0;
  const [brand500] = useToken("colors", ["brand.500"]);
  const [running, setRunning] = useState<RunningStatus>(RunningStatus.STOPPED);

  useEffect(() => {
    if (shown) {
      ref.current!.focus();
    } else {
      showSimulatorButtonRef.current!.focus();
    }
  }, [showSimulatorButtonRef, shown]);

  return (
    <DeviceContextProvider value={simulator.current}>
      <Flex
        flex="1 1 100%"
        flexDirection="column"
        height="100%"
        position="relative"
      >
        <Flex
          position="absolute"
          top={0}
          left={0}
          alignItems="center"
          height={topBarHeight}
        >
          <HideSplitViewButton
            aria-label={intl.formatMessage({ id: "simulator-collapse" })}
            onClick={onSimulatorHide}
            splitViewShown={shown}
            direction="expandLeft"
          />
        </Flex>
        <VStack spacing={5} bg="gray.25" ref={simControlsRef}>
          <Box width="100%" pb={1} px={5} maxW="md" minW={minWidth}>
            <AspectRatio ratio={191.27 / 155.77} width="100%">
              <Box
                ref={ref}
                as="iframe"
                src={`${url}?color=${encodeURIComponent(brand500)}`}
                title={simulatorTitle}
                name={simulatorTitle}
                frameBorder="no"
                scrolling="no"
                allow="autoplay;microphone"
              />
            </AspectRatio>
            <SimulatorActionBar
              as="section"
              aria-label={intl.formatMessage({ id: "simulator-actions" })}
              overflow="hidden"
              running={running}
              onRunningChange={setRunning}
            />
          </Box>
        </VStack>
        <SimulatorSplitView simHeight={simHeight} simRunning={running} />
      </Flex>
    </DeviceContextProvider>
  );
};

const updateTranslations = (
  simulator: SimulatorDeviceConnection,
  intl: IntlShape
) => {
  const config = {
    language: intl.locale,
    translations: Object.fromEntries(
      ["button-a", "button-b", "touch-logo", "start-simulator"].map((k) => [
        k,
        intl.formatMessage({ id: "simulator-" + k }),
      ])
    ),
  };
  simulator.configure(config);
};

export default Simulator;

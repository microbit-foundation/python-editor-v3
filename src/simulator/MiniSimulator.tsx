import { useEffect, useRef, MutableRefObject, useCallback } from "react";
import {
  AspectRatio,
  Box,
} from "@chakra-ui/react";
import { SimulatorDeviceConnection, EVENT_STATE_CHANGE, EVENT_REQUEST_FLASH } from "../device/simulator";
import { useLogging } from "../logging/logging-hooks";
import { MAIN_FILE } from "../fs/fs"

const simulatorURL = "https://olivercwy.github.io/microbit-simulator-build/simulator.html"

export type flashType = (code: string) => Promise<void>

interface SimulatorProps {
    size: number,
    debug?: boolean,
    displayBoard?: boolean,
    requestCode: () => string,
    flash?: MutableRefObject<flashType | null>
}

export const Simulator = ({
    size,
    debug,
    displayBoard,
    requestCode,
    flash
}: SimulatorProps) => {

    const ref = useRef<HTMLIFrameElement>(null);
    const logging = useLogging();
    const simulator = useRef(
        new SimulatorDeviceConnection(logging, () => {
            return ref.current;
        })
    );

    const flashLocal = useCallback((code: string) => {
        if (debug) console.log(code);
        const iframe = ref.current;
        if (!iframe) {
            throw new Error("Missing simulator iframe.");
        }
        const sim = simulator.current;

        const dataSource = {
          async files() {
            return {
              [MAIN_FILE]: new TextEncoder().encode(code),
            };
          },
          fullFlashData() {
            throw new Error("Unsupported");
          },
          partialFlashData() {
            throw new Error("Unsupported");
          },
        };

        return sim.flash(dataSource, {
          partial: false,
          progress: () => {},
        });
    },[debug])

    if (flash){
        flash.current = flashLocal
    }

    useEffect(() => {
        const sim = simulator.current;
        sim.initialize();
        sim.addListener(EVENT_REQUEST_FLASH, () => {
            flashLocal(requestCode())
        });
        sim.addListener(EVENT_STATE_CHANGE, () => {
            sim.setDisplay(displayBoard === undefined ? true : displayBoard)
        });
        return () => {
            sim.dispose();
        };
    }, [requestCode, flashLocal]);

    useEffect(()=>{
        simulator.current.setDisplay(displayBoard === undefined ? true : displayBoard)
    },[displayBoard, simulator.current])

    return (
        <Box width={size} height={size} overflow="hidden" textAlign='center'>
            <AspectRatio ratio={191.27 / 155.77}  position="relative" left="-95.7%" top="-77.3%" width="290%" maxH="300%" >
                <Box
                    ref={ref}
                    as="iframe"
                    src={simulatorURL}
                    frameBorder="no"
                    scrolling="no"
                    allow="autoplay;microphone"
                    sandbox="allow-scripts allow-same-origin"
                />
            </AspectRatio>
        </Box>
    );

}

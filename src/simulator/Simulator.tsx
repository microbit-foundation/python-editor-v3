import { Box, HStack, IconButton, Stack } from "@chakra-ui/react";
import { useCallback, useEffect, useRef } from "react";
import { RiPlayFill, RiStopFill } from "react-icons/ri";
import { MAIN_FILE } from "../fs/fs";
import { useFileSystem } from "../fs/fs-hooks";

const useSimulator = (ref: React.RefObject<HTMLIFrameElement>) => {
  const fs = useFileSystem();
  const readyCallbacks = useRef([] as Array<() => void>);
  useEffect(() => {
    if (ref.current) {
      const messageListener = (e: MessageEvent) => {
        const simulator = ref.current!.contentWindow;
        if (e.source === simulator) {
          switch (e.data.kind) {
            case "ready": {
              // TODO: sensors
              while (readyCallbacks.current.length) {
                readyCallbacks.current.pop()!();
              }
              break;
            }
            case "serial_output": {
              // TODO: serial
              break;
            }
          }
        }
      };
      window.addEventListener("message", messageListener);
      return () => {
        window.removeEventListener("message", messageListener);
      };
    }
  }, [ref, readyCallbacks]);

  const play = useCallback(async () => {
    // Temporary approach until we have simulator filesystem support.
    const main = new TextDecoder().decode((await fs.read(MAIN_FILE)).data);
    const simulator = ref.current!.contentWindow!;
    simulator.postMessage(
      {
        kind: "serial_input",
        // Ctrl-C to interrupt, Ctrl-D to reboot (straight to REPL as no program)
        data: `\x03\x04`,
      },
      "*"
    );

    // Wait for the ready message after the reboot.
    await new Promise<void>((resolve) => readyCallbacks.current.push(resolve));

    simulator.postMessage(
      {
        kind: "serial_input",
        // Ctrl-E to enter paste mode and Ctrl-D to finish
        data: `\x05${main}\x04`.replace(/\n/g, "\r"),
      },
      "*"
    );
  }, [ref, fs]);

  const stop = useCallback(async () => {
    const simulator = ref.current!.contentWindow!;
    simulator.postMessage(
      {
        kind: "serial_input",
        // Ctrl-C to interrupt.
        data: `\x03\x04`,
      },
      "*"
    );
  }, [ref]);

  return {
    play,
    stop,
  };
};

const Simulator = () => {
  const ref = useRef<HTMLIFrameElement>(null);
  const { play, stop } = useSimulator(ref);
  return (
    <Stack>
      <Box
        ref={ref}
        as="iframe"
        // Very much a temporary / unsupported deployment!
        src="https://distracted-dubinsky-fd8a42.netlify.app/simulator.html"
        title="Simulator"
        frameBorder="no"
        scrolling="no"
        width={300}
        height={241}
      />
      <HStack justifyContent="center">
        <IconButton onClick={play} icon={<RiPlayFill />} aria-label="Play" />
        <IconButton onClick={stop} icon={<RiStopFill />} aria-label="Stop" />
      </HStack>
    </Stack>
  );
};

export default Simulator;

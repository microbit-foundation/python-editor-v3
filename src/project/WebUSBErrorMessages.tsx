import { Link, VStack } from "@chakra-ui/layout";

const defaultTitle = "WebUSB error";

export const webusbErrorMessages = {
  "update-req": {
    title: "Please update the micro:bit firmware",
    description: (
      <span>
        You need to{" "}
        <Link
          target="_blank"
          rel="noreferrer"
          href="https://microbit.org/firmware/"
          textDecoration="underline"
        >
          update your micro:bit firmware
        </Link>{" "}
        to make use of this feature.
      </span>
    ),
  },
  "clear-connect": {
    title: "Unable to claim interface",
    description: (
      <VStack alignItems="stretch" mt={1}>
        <p>Another process is connected to this device.</p>
        <p>
          Close any other tabs that may be using WebUSB (e.g. MakeCode, Python
          Editor), or unplug and replug the micro:bit before trying again.
        </p>
      </VStack>
    ),
  },
  "reconnect-microbit": {
    title: defaultTitle,
    description: "Please reconnect your micro:bit and try again.",
  },
  "timeout-error": {
    title: "Connection timed out",
    description: "Unable to connect to the micro:bit",
  },
  unavailable: {
    title: defaultTitle,
    description: (
      <VStack alignItems="stretch" mt={1}>
        <p>
          With WebUSB you can program your micro:bit and connect to the serial
          console directly from the online editor.
        </p>
        <p>
          Unfortunately, WebUSB is not supported in this browser. We recommend
          Chrome, or a Chrome-based browser to use WebUSB.
        </p>
      </VStack>
    ),
  },
};

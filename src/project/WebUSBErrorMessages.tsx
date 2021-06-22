import { Link, VStack } from "@chakra-ui/layout";
import { FormattedMessage } from "react-intl";

const defaultTitle = "WebUSB error";

export const webusbErrorMessages = {
  "update-req": {
    title: "Please update the micro:bit firmware",
    description: (
      <span>
        {/* come back later: parameter weird*/}
        You need to{" "}
        <Link
          target="_blank"
          rel="noreferrer"
          href="https://microbit.org/firmware/"
          textDecoration="underline"
        >
          <FormattedMessage id="update-firmware" />
        </Link>{" "}
        <FormattedMessage id="use-feature" />
      </span>
    ),
  },
  "clear-connect": {
    title: "Unable to claim interface",
    description: (
      <VStack alignItems="stretch" mt={1}>
        <p>
          <FormattedMessage id="another-process" />
        </p>
        <p>
          <FormattedMessage id="before-trying-again" />
        </p>
      </VStack>
    ),
  },
  "reconnect-microbit": {
    title: defaultTitle,
    // hook problem again
    // come back later, property , expected
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
          <FormattedMessage id="with-WebUSB" />
        </p>
        <p>
          <FormattedMessage id="browser-not-supported" />
        </p>
      </VStack>
    ),
  },
};

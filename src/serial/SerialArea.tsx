import { BoxProps, Flex } from "@chakra-ui/react";
import { useIntl } from "react-intl";
import Placeholder from "../common/Placeholder";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import XTerm from "./XTerm";

const SerialArea = (props: BoxProps) => {
  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  const intl = useIntl();
  return (
    <Flex {...props} flexDirection="column" alignItems="stretch" height="100%">
      {connected ? (
        <XTerm flex="1 1 auto" height={0} />
      ) : (
        <Placeholder
          flex="1 1 auto"
          backgroundColor="black"
          color="white"
          text={intl.formatMessage({
            id: "connect-microbit",
          })}
        />
      )}
    </Flex>
  );
};

export default SerialArea;

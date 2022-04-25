/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  HStack,
  Image,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialogComponent } from "../../common/GenericDialog";
import { useProjectActions } from "../../project/project-hooks";
import firmwareUpgrade from "./firmware-upgrade.png";

interface FirmwareDialogProps extends GenericDialogComponent {}

export const FirmwareDialogBody = () => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={8}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        Firmware update required
      </Text>
      <Text>
        Connecting to the micro:bit failed because the firmware on your
        micro:bit is too old.
      </Text>
      <HStack spacing={8}>
        <Image height={150} src={firmwareUpgrade} alt="" />
        <VStack spacing={5}>
          <Text>
            You must{" "}
            <Link
              color="brand.500"
              target="_blank"
              rel="noreferrer"
              href="https://microbit.org/get-started/user-guide/firmware/"
            >
              update your firmware
            </Link>{" "}
            before you can connect to this micro:bit.
          </Text>
          <Table size="sm" width="auto">
            <Tbody>
              <Tr>
                <Td>Your firmware version:</Td>
                <Td>0241 (estimated)</Td>
              </Tr>
              <Tr>
                <Td>Required firmware version:</Td>
                <Td>0249 (or higher)</Td>
              </Tr>
            </Tbody>
          </Table>
        </VStack>
      </HStack>
      <Link
        color="brand.500"
        target="_blank"
        rel="noreferrer"
        href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
      >
        Troubleshoot problems with connecting to your micro:bit
      </Link>
    </VStack>
  );
};

export const FirmwareDialogFooter = ({ onClose }: FirmwareDialogProps) => {
  const actions = useProjectActions();
  const handleTryAgain = useCallback(async () => {
    onClose();
    await actions.connect();
  }, [actions, onClose]);
  const buttonWidth = "8.1rem";
  return (
    <HStack spacing={2.5}>
      <Button onClick={onClose} size="lg" minWidth={buttonWidth}>
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onClick={handleTryAgain} size="lg" minWidth={buttonWidth}>
        <FormattedMessage id="try-again-action" />
      </Button>
      <Button variant="solid" size="lg" minWidth={buttonWidth}>
        <Link
          target="_blank"
          rel="noreferrer"
          href="https://microbit.org/get-started/user-guide/firmware/"
          _hover={{
            textDecoration: "none",
          }}
        >
          <FormattedMessage id="update-firmware-action" />
        </Link>
      </Button>
    </HStack>
  );
};

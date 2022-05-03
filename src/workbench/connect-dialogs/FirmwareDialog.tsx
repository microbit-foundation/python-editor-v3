/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Icon } from "@chakra-ui/icons";
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
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { GenericDialogComponent } from "../../common/GenericDialog";
import { useDevice } from "../../device/device-hooks";
import { useProjectActions } from "../../project/project-hooks";
import firmwareUpgrade from "./firmware-upgrade.svg";

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
              update your firmware <Icon as={RiExternalLinkLine} />
            </Link>{" "}
            before you can connect to this micro:bit.
          </Text>
        </VStack>
      </HStack>
      <Link
        color="brand.500"
        target="_blank"
        rel="noreferrer"
        href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
      >
        Troubleshoot problems with connecting to your micro:bit{" "}
        <Icon as={RiExternalLinkLine} />
      </Link>
    </VStack>
  );
};

export const FirmwareDialogFooter = ({ onClose }: FirmwareDialogProps) => {
  const actions = useProjectActions();
  const device = useDevice();
  const handleTryAgain = useCallback(async () => {
    onClose();
    device.clearDevice();
    await actions.connect();
  }, [actions, device, onClose]);
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
          <FormattedMessage id="update-firmware-action" />{" "}
          <Icon as={RiExternalLinkLine} />
        </Link>
      </Button>
    </HStack>
  );
};

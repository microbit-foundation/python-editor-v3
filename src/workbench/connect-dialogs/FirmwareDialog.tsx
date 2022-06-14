/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Icon } from "@chakra-ui/icons";
import { HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback, useState } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import firmwareUpgrade from "./firmware-upgrade.svg";

export const enum ConnectErrorChoice {
  TryAgain,
  Cancel,
}

interface FirmwareDialogProps {
  callback: (choice: ConnectErrorChoice) => void;
}

const FirmwareDialog = ({ callback }: FirmwareDialogProps) => {
  const [returnFocus, setReturnFocus] = useState<boolean>(true);
  const onTryAgain = useCallback(() => {
    setReturnFocus(false);
    callback(ConnectErrorChoice.TryAgain);
  }, [callback, setReturnFocus]);
  return (
    <GenericDialog
      returnFocusOnClose={returnFocus}
      body={<FirmwareDialogBody />}
      footer={
        <FirmwareDialogFooter
          onClose={() => callback(ConnectErrorChoice.Cancel)}
          onTryAgain={onTryAgain}
        />
      }
      size="3xl"
      onClose={() => callback(ConnectErrorChoice.Cancel)}
    />
  );
};

const FirmwareDialogBody = () => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={5}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="firmware-update-title" />
      </Text>
      <Text>
        <FormattedMessage id="firmware-update-message" />
      </Text>
      <HStack spacing={8}>
        <Image height={150} width={144} src={firmwareUpgrade} alt="" />
        <VStack spacing={5}>
          <Text>
            <FormattedMessage
              id="firmware-update-link"
              values={{
                link: (chunks: ReactNode) => (
                  <Link
                    color="brand.500"
                    target="_blank"
                    rel="noreferrer"
                    href="https://microbit.org/get-started/user-guide/firmware/"
                  >
                    {chunks}{" "}
                    <Icon as={RiExternalLinkLine} verticalAlign="middle" />
                  </Link>
                ),
              }}
            />
          </Text>
        </VStack>
      </HStack>
      <Link
        color="brand.500"
        target="_blank"
        rel="noreferrer"
        href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
      >
        <FormattedMessage id="connect-troubleshoot" />{" "}
        <Icon as={RiExternalLinkLine} verticalAlign="middle" />
      </Link>
    </VStack>
  );
};

interface FirmwareDialogFooterProps {
  onClose: () => void;
  onTryAgain: () => void;
}

const FirmwareDialogFooter = ({
  onClose,
  onTryAgain,
}: FirmwareDialogFooterProps) => {
  const buttonWidth = "8.1rem";
  return (
    <HStack spacing={2.5}>
      <Button onClick={onClose} size="lg" minWidth={buttonWidth}>
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onClick={onTryAgain} size="lg" minWidth={buttonWidth}>
        <FormattedMessage id="try-again-action" />
      </Button>
      <Button
        as="a"
        variant="solid"
        size="lg"
        minWidth={buttonWidth}
        rightIcon={<RiExternalLinkLine />}
        target="_blank"
        rel="noopener"
        href="https://microbit.org/get-started/user-guide/firmware/"
      >
        <FormattedMessage id="update-firmware-action" />
      </Button>
    </HStack>
  );
};

export default FirmwareDialog;

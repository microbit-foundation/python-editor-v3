/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Icon, Image, Link, LinkButton, Text } from "@microbit/ui";
import { ReactNode, useCallback } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { HStack, VStack } from "styled-system/jsx";
import DialogHeading from "../../common/DialogHeading";
import { GenericDialog } from "../../common/GenericDialog";
import firmwareUpgrade from "./firmware-upgrade.svg";
import { FinalFocusRef } from "../../project/project-actions";

export const enum ConnectErrorChoice {
  TRY_AGAIN = "TRY_AGAIN",
  CANCEL = "CANCEL",
}

interface FirmwareDialogProps {
  callback: (choice: ConnectErrorChoice) => void;
  finalFocusRef: FinalFocusRef;
}

const FirmwareDialog = ({ callback, finalFocusRef }: FirmwareDialogProps) => {
  const onTryAgain = useCallback(() => {
    callback(ConnectErrorChoice.TRY_AGAIN);
  }, [callback]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      body={<FirmwareDialogBody />}
      footer={
        <FirmwareDialogFooter
          onClose={() => callback(ConnectErrorChoice.CANCEL)}
          onTryAgain={onTryAgain}
        />
      }
      size="3xl"
      onClose={() => callback(ConnectErrorChoice.CANCEL)}
    />
  );
};

const FirmwareDialogBody = () => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p="5"
      pb="0"
      gap="5"
      alignItems="flex-start"
    >
      <DialogHeading>
        <FormattedMessage id="firmware-update-title" />
      </DialogHeading>
      <Text>
        <FormattedMessage id="firmware-update-message" />
      </Text>
      <HStack gap="8">
        <Image height="150px" width="144px" src={firmwareUpgrade} alt="" />
        <VStack gap="5">
          <Text>
            <FormattedMessage
              id="firmware-update-link"
              values={{
                link: (chunks: ReactNode) => (
                  <Link
                    color="brand.500"
                    display="inline-flex"
                    alignItems="center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://microbit.org/get-started/user-guide/firmware/"
                  >
                    {chunks}
                    <Icon as={RiExternalLinkLine} css={{ ml: 1 }} />
                  </Link>
                ),
              }}
            />
          </Text>
        </VStack>
      </HStack>
      <Link
        color="brand.500"
        display="inline-flex"
        alignItems="center"
        target="_blank"
        rel="noreferrer"
        href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
      >
        <FormattedMessage id="connect-troubleshoot" />
        <Icon as={RiExternalLinkLine} css={{ ml: 1 }} />
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
    <HStack gap="2.5">
      <Button onPress={onClose} size="lg" css={{ minWidth: buttonWidth }}>
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onPress={onTryAgain} size="lg" css={{ minWidth: buttonWidth }}>
        <FormattedMessage id="try-again-action" />
      </Button>
      <LinkButton
        variant="primary"
        size="lg"
        css={{ minWidth: buttonWidth }}
        target="_blank"
        rel="noreferrer"
        href="https://microbit.org/get-started/user-guide/firmware/"
        endIcon={<Icon as={RiExternalLinkLine} />}
      >
        <FormattedMessage id="update-firmware-action" />
      </LinkButton>
    </HStack>
  );
};

export default FirmwareDialog;

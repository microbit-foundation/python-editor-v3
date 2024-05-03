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
  const [returnFocus, setReturnFocus] = useState<boolean>(true);
  const onTryAgain = useCallback(() => {
    setReturnFocus(false);
    callback(ConnectErrorChoice.TRY_AGAIN);
  }, [callback, setReturnFocus]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      returnFocusOnClose={returnFocus}
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
                    display="inline-flex"
                    alignItems="center"
                    target="_blank"
                    rel="noreferrer"
                    href="https://microbit.org/get-started/user-guide/firmware/"
                  >
                    {chunks}
                    <Icon as={RiExternalLinkLine} ml={1} />
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
        <Icon as={RiExternalLinkLine} ml={1} />
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

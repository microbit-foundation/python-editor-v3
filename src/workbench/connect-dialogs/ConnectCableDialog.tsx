/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Flex, HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import connectCable from "./connect-cable.gif";
import { ConnectHelpChoice } from "./ConnectHelpDialog";

interface ConnectCableDialogProps {
  callback: (choice: ConnectHelpChoice) => void;
  dialogNormallyHidden: boolean;
}

const ConnectCableDialog = ({
  callback,
  dialogNormallyHidden,
}: ConnectCableDialogProps) => (
  <GenericDialog
    onClose={() => callback(ConnectHelpChoice.Cancel)}
    body={<ConnectCableDialogBody />}
    footer={
      <ConnectCableDialogFooter
        onClose={() => callback(ConnectHelpChoice.Cancel)}
        onNext={() => callback(ConnectHelpChoice.Next)}
        onNextDontShowAgain={() =>
          callback(ConnectHelpChoice.NextDontShowAgain)
        }
        dialogNormallyHidden={dialogNormallyHidden}
      />
    }
    size="3xl"
  />
);

const ConnectCableDialogBody = () => {
  return (
    <VStack
      width="auto"
      ml="auto"
      mr="auto"
      p={8}
      pt={[5, 5, 8]}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="connect-cable-title" />
      </Text>

      <Flex justifyContent="center" width="100%">
        <Image height="372px" width="400px" src={connectCable} alt="" />
      </Flex>
    </VStack>
  );
};

interface ConnectCableDialogFooterProps {
  onClose: () => void;
  onNext: () => void;
  onNextDontShowAgain: () => void;
  dialogNormallyHidden: boolean;
}

const ConnectCableDialogFooter = ({
  onClose,
  onNext,
  onNextDontShowAgain,
  dialogNormallyHidden,
}: ConnectCableDialogFooterProps) => {
  return (
    <HStack spacing={2.5} width={dialogNormallyHidden ? "auto" : "100%"}>
      {!dialogNormallyHidden && (
        <Link
          onClick={onNextDontShowAgain}
          as="button"
          color="brand.500"
          mr="auto"
        >
          <FormattedMessage id="dont-show-again" />
        </Link>
      )}
      <Button onClick={onClose} size="lg">
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onClick={onNext} variant="solid" size="lg">
        <FormattedMessage id="next-action" />
      </Button>
    </HStack>
  );
};

export default ConnectCableDialog;

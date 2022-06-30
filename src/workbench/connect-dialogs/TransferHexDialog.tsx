/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Flex, HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import transferHexMac from "./transfer-hex-mac.gif";
import transferHexWin from "./transfer-hex-win.gif";

export const enum TransferHexChoice {
  CancelDontShowAgain,
  Cancel,
}

interface TransferHexDialogProps {
  callback: (value: TransferHexChoice) => void;
  dialogNormallyHidden: boolean;
}

export const TransferHexDialog = ({
  callback,
  dialogNormallyHidden,
}: TransferHexDialogProps) => {
  return (
    <GenericDialog
      onClose={() => callback(TransferHexChoice.Cancel)}
      body={<TransferHexDialogBody />}
      footer={
        <TransferHexDialogFooter
          dialogNormallyHidden={dialogNormallyHidden}
          onCancel={() => callback(TransferHexChoice.Cancel)}
          onCancelDontShowAgain={() =>
            callback(TransferHexChoice.CancelDontShowAgain)
          }
        />
      }
      size="3xl"
    />
  );
};

const TransferHexDialogBody = () => {
  const isMac = /Mac/.test(navigator.platform);
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
      <VStack alignItems="flex-start">
        <Text as="h2" fontSize="xl" fontWeight="semibold">
          <FormattedMessage id="transfer-hex-title" />
        </Text>
        <Text>
          <FormattedMessage
            id="transfer-hex-message-one"
            values={{
              strong: (chunks: ReactNode) => (
                <Text as="span" fontWeight="semibold">
                  {chunks}
                </Text>
              ),
            }}
          />
        </Text>
        <Text fontStyle="italic">
          <FormattedMessage
            id="transfer-hex-message-two"
            values={{
              strong: (chunks: ReactNode) => (
                <Text as="span" fontWeight="semibold">
                  {chunks}
                </Text>
              ),
            }}
          />
        </Text>
      </VStack>
      <Flex justifyContent="center" width="100%">
        <Image
          width="100%"
          height="100%"
          src={isMac ? transferHexMac : transferHexWin}
          alt=""
        />
      </Flex>
    </VStack>
  );
};

interface TransferHexDialogFooterProps {
  onCancel: () => void;
  onCancelDontShowAgain: () => void;
  dialogNormallyHidden: boolean;
}

const TransferHexDialogFooter = ({
  onCancel,
  onCancelDontShowAgain,
  dialogNormallyHidden,
}: TransferHexDialogFooterProps) => {
  return (
    <HStack spacing={2.5} width={dialogNormallyHidden ? "auto" : "100%"}>
      {!dialogNormallyHidden && (
        <Link
          onClick={onCancelDontShowAgain}
          as="button"
          color="brand.500"
          mr="auto"
        >
          <FormattedMessage id="dont-show-again" />
        </Link>
      )}
      <Button onClick={onCancel} variant="solid" size="lg">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default TransferHexDialog;

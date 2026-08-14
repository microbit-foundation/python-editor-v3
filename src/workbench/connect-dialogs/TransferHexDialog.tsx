/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon, Image, Text } from "@microbit/ui";
import { ReactNode } from "react";
import { RiInformationLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { Flex, HStack, VStack } from "styled-system/jsx";
import DialogHeading from "../../common/DialogHeading";
import { GenericDialog, GenericDialogFooter } from "../../common/GenericDialog";
import transferHexMac from "./transfer-hex-mac.gif";
import transferHexWin from "./transfer-hex-win.gif";
import { FinalFocusRef } from "../../project/project-actions";

export const enum TransferHexChoice {
  CloseDontShowAgain,
  Close,
}

interface TransferHexDialogProps {
  callback: (value: TransferHexChoice) => void;
  dialogNormallyHidden: boolean;
  shownByRequest: boolean;
  finalFocusRef: FinalFocusRef;
}

export const TransferHexDialog = ({
  callback,
  dialogNormallyHidden,
  shownByRequest,
  finalFocusRef,
}: TransferHexDialogProps) => {
  return (
    <GenericDialog
      onClose={() => callback(TransferHexChoice.Close)}
      finalFocusRef={finalFocusRef}
      body={<TransferHexDialogBody />}
      footer={
        <GenericDialogFooter
          shownByRequest={shownByRequest}
          dialogNormallyHidden={dialogNormallyHidden}
          onClose={() => callback(TransferHexChoice.Close)}
          onCloseDontShowAgain={() =>
            callback(TransferHexChoice.CloseDontShowAgain)
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
      p="5"
      pb="0"
      gap="5"
      alignItems="flex-start"
    >
      <VStack alignItems="flex-start">
        <DialogHeading>
          <FormattedMessage id="transfer-hex-title" />
        </DialogHeading>
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
        <HStack gap="1">
          <Icon as={RiInformationLine} />
          <Text>
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
        </HStack>
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

export default TransferHexDialog;

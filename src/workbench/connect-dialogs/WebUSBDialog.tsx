/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Text, VStack } from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";

export const enum WebUSBErrorTrigger {
  Connect,
  Flash,
}

interface WebUSBDialogProps {
  callback: () => void;
  action: WebUSBErrorTrigger;
}

export const WebUSBDialog = ({ callback, action }: WebUSBDialogProps) => {
  const handleClose = useCallback(() => {
    callback();
  }, [callback]);
  return (
    <GenericDialog
      onClose={handleClose}
      body={<WebUSBDialogBody action={action} />}
      footer={<WebUSBDialogFooter onCancel={handleClose} />}
      size="3xl"
    />
  );
};

interface WebUSBDialogBodyProps {
  action: WebUSBErrorTrigger;
}

const WebUSBDialogBody = ({ action }: WebUSBDialogBodyProps) => {
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
        <FormattedMessage id="webusb-not-supported-title" />
      </Text>
      <Text>
        <FormattedMessage id="webusb-not-supported" />
      </Text>
      <Text>
        <FormattedMessage id="webusb-why-use" />
      </Text>
    </VStack>
  );
};

interface WebUSBDialogFooterProps {
  onCancel: () => void;
}

const WebUSBDialogFooter = ({ onCancel }: WebUSBDialogFooterProps) => {
  return (
    <HStack spacing={2.5}>
      <Button onClick={onCancel} size="lg">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default WebUSBDialog;

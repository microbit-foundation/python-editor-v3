/**
 * (c) 2021 - 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text } from "@microbit/ui";
import { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { HStack, VStack } from "styled-system/jsx";
import DialogHeading from "../../common/DialogHeading";
import { GenericDialog } from "../../common/GenericDialog";
import { FinalFocusRef } from "../../project/project-actions";

interface WebUSBErrorDialogProps {
  callback: () => void;
  finalFocusRef: FinalFocusRef;
  title: ReactNode;
  description: ReactNode;
}

export const WebUSBErrorDialog = ({
  callback,
  finalFocusRef,
  title,
  description,
}: WebUSBErrorDialogProps) => {
  const handleClose = useCallback(() => {
    callback();
  }, [callback]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      onClose={handleClose}
      body={<WebUSBErrorBody title={title} description={description} />}
      footer={<WebUSBErrorDialogFooter onCancel={handleClose} />}
      size="2xl"
    />
  );
};

interface WebUSBErrorBodyProps {
  title: ReactNode;
  description: ReactNode;
}

const WebUSBErrorBody = ({ title, description }: WebUSBErrorBodyProps) => (
  <VStack
    width="auto"
    ml="auto"
    mr="auto"
    p="8"
    pb="0"
    gap="5"
    alignItems="flex-start"
  >
    <DialogHeading>{title}</DialogHeading>
    {typeof description === "string" ? <Text>{description}</Text> : description}
  </VStack>
);

interface WebUSBErrorDialogFooterProps {
  onCancel: () => void;
}

const WebUSBErrorDialogFooter = ({
  onCancel,
}: WebUSBErrorDialogFooterProps) => {
  return (
    <HStack gap="2.5">
      <Button onPress={onCancel} size="lg" variant="primary">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default WebUSBErrorDialog;

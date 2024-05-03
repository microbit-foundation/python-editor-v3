/**
 * (c) 2021 - 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Text, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
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
    p={8}
    pb={0}
    spacing={5}
    alignItems="flex-start"
  >
    {typeof title === "string" ? (
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        {title}
      </Text>
    ) : (
      title
    )}
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
    <HStack spacing={2.5}>
      <Button onClick={onCancel} size="lg" variant="solid">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default WebUSBErrorDialog;

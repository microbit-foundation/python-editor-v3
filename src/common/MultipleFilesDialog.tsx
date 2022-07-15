/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../common/GenericDialog";

interface MultipleFilesDialogProps {
  callback: () => void;
}

export const MultipleFilesDialog = ({ callback }: MultipleFilesDialogProps) => {
  return (
    <GenericDialog
      onClose={() => callback()}
      body={<MultipleFilesDialogBody />}
      footer={<MultipleFilesDialogFooter onClose={() => callback()} />}
      size="xl"
    />
  );
};

const MultipleFilesDialogBody = () => {
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
        <FormattedMessage id="multiple-files-title" />
      </Text>
      <Text>
        <FormattedMessage id="multiple-files-message" />
      </Text>
    </VStack>
  );
};

interface MultipleFilesDialogFooterProps {
  onClose: () => void;
}

const MultipleFilesDialogFooter = ({
  onClose,
}: MultipleFilesDialogFooterProps) => {
  return (
    <HStack spacing={2.5}>
      <Button onClick={onClose} size="md">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default MultipleFilesDialog;

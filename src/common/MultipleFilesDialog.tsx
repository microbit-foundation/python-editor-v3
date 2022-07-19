/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiInformationLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { GenericDialog, GenericDialogFooter } from "../common/GenericDialog";

export const enum MultipleFilesChoice {
  CloseDontShowAgain,
  Close,
}

interface MultipleFilesDialogProps {
  callback: (value: MultipleFilesChoice) => void;
}

export const MultipleFilesDialog = ({ callback }: MultipleFilesDialogProps) => {
  return (
    <GenericDialog
      onClose={() => callback(MultipleFilesChoice.Close)}
      body={<MultipleFilesDialogBody />}
      footer={
        <GenericDialogFooter
          onClose={() => callback(MultipleFilesChoice.Close)}
          onCloseDontShowAgain={() =>
            callback(MultipleFilesChoice.CloseDontShowAgain)
          }
          dialogNormallyHidden={false}
        />
      }
      size="2xl"
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
        <FormattedMessage
          id="multiple-files-message-one"
          values={{
            strong: (chunks: ReactNode) => (
              <Text as="span" fontWeight="semibold">
                {chunks}
              </Text>
            ),
          }}
        />
      </Text>
      <Text>
        <FormattedMessage
          id="multiple-files-message-two"
          values={{
            strong: (chunks: ReactNode) => (
              <Text as="span" fontWeight="semibold">
                {chunks}
              </Text>
            ),
          }}
        />
      </Text>
      <HStack spacing={1}>
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
  );
};

export default MultipleFilesDialog;

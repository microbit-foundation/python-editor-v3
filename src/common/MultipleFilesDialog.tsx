/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialog, GenericDialogFooter } from "../common/GenericDialog";
import { useProject } from "../project/project-hooks";

export const enum MultipleFilesChoice {
  CloseDontShowAgain,
  Close,
}

interface MultipleFilesDialogProps {
  callback: (value: MultipleFilesChoice) => void;
  finalFocusRef: React.RefObject<HTMLButtonElement>;
}

export const MultipleFilesDialog = ({
  callback,
  finalFocusRef,
}: MultipleFilesDialogProps) => {
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
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
  const project = useProject();
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
            fileCount: project.files.length,
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
    </VStack>
  );
};

export default MultipleFilesDialog;

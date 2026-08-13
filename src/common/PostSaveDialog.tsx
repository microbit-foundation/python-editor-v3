/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link, Text } from "@microbit/ui";
import { VStack } from "styled-system/jsx";
import { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import DialogHeading from "../common/DialogHeading";
import { GenericDialog, GenericDialogFooter } from "../common/GenericDialog";
import { useProject } from "../project/project-hooks";
import { FinalFocusRef } from "../project/project-actions";

export const enum PostSaveChoice {
  ShowTransferHexHelp,
  CloseDontShowAgain,
  Close,
}

interface PostSaveDialogProps {
  callback: (value: PostSaveChoice) => void;
  dialogNormallyHidden: boolean;
  finalFocusRef: FinalFocusRef;
}

export const PostSaveDialog = ({
  callback,
  dialogNormallyHidden,
  finalFocusRef,
}: PostSaveDialogProps) => {
  const onShowTransferHexHelp = useCallback(() => {
    callback(PostSaveChoice.ShowTransferHexHelp);
  }, [callback]);
  return (
    <GenericDialog
      onClose={() => callback(PostSaveChoice.Close)}
      finalFocusRef={finalFocusRef}
      body={
        <PostSaveDialogBody onShowTransferHexHelp={onShowTransferHexHelp} />
      }
      footer={
        <GenericDialogFooter
          dialogNormallyHidden={dialogNormallyHidden}
          onClose={() => callback(PostSaveChoice.Close)}
          onCloseDontShowAgain={() =>
            callback(PostSaveChoice.CloseDontShowAgain)
          }
        />
      }
      size="2xl"
    />
  );
};

interface PostSaveDialogBodyProps {
  onShowTransferHexHelp: () => void;
}

const PostSaveDialogBody = ({
  onShowTransferHexHelp,
}: PostSaveDialogBodyProps) => {
  const project = useProject();
  const handleShowTransferHexHelp = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onShowTransferHexHelp();
    },
    [onShowTransferHexHelp]
  );
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
      <DialogHeading>
        <FormattedMessage id="post-save-title" />
      </DialogHeading>
      <Text>
        <FormattedMessage
          id="post-save-message-one"
          values={{
            strong: (chunks: ReactNode) => (
              <Text as="span" fontWeight="semibold">
                {chunks}
              </Text>
            ),
          }}
        />
      </Text>
      {project.files.length > 1 && (
        <Text>
          <FormattedMessage
            id="post-save-message-files"
            values={{
              strong: (chunks: ReactNode) => (
                <Text as="span" fontWeight="semibold">
                  {chunks}
                </Text>
              ),
            }}
          />
        </Text>
      )}
      <Text>
        <FormattedMessage
          id="post-save-message-two"
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
          id="post-save-transfer-hex"
          values={{
            link: (chunks: ReactNode) => (
              <Link
                color="brand.500"
                onClick={handleShowTransferHexHelp}
                href=""
                cursor="pointer"
              >
                {chunks}
              </Link>
            ),
          }}
        />
      </Text>
    </VStack>
  );
};

export default PostSaveDialog;

/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Link, Text, VStack } from "@chakra-ui/react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../common/GenericDialog";
import { useFileSystem } from "../fs/fs-hooks";

export const enum PostSaveChoice {
  ShowTransferHexHelp,
  CloseDontShowAgain,
  Close,
}

interface PostSaveDialogProps {
  callback: (value: PostSaveChoice) => void;
  dialogNormallyHidden: boolean;
}

export const PostSaveDialog = ({
  callback,
  dialogNormallyHidden,
}: PostSaveDialogProps) => {
  const [returnFocus, setReturnFocus] = useState<boolean>(true);
  const onShowTransferHexHelp = useCallback(() => {
    setReturnFocus(false);
    callback(PostSaveChoice.ShowTransferHexHelp);
  }, [callback, setReturnFocus]);
  return (
    <GenericDialog
      returnFocusOnClose={returnFocus}
      onClose={() => callback(PostSaveChoice.Close)}
      body={
        <PostSaveDialogBody onShowTransferHexHelp={onShowTransferHexHelp} />
      }
      footer={
        <PostSaveDialogFooter
          dialogNormallyHidden={dialogNormallyHidden}
          onClose={() => callback(PostSaveChoice.Close)}
          onCloseDontShowAgain={() =>
            callback(PostSaveChoice.CloseDontShowAgain)
          }
        />
      }
      size="xl"
    />
  );
};

interface PostSaveDialogBodyProps {
  onShowTransferHexHelp: () => void;
}

const PostSaveDialogBody = ({
  onShowTransferHexHelp,
}: PostSaveDialogBodyProps) => {
  const fs = useFileSystem();
  const [multipleFiles, setMultipleFiles] = useState<boolean>(false);
  useEffect(() => {
    const areMultipleFiles = async () => {
      const result = (await fs.statistics()).files > 1;
      setMultipleFiles(result);
    };
    areMultipleFiles();
  }, [fs, setMultipleFiles]);
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
      p={5}
      pb={0}
      spacing={5}
      alignItems="flex-start"
    >
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="post-save-title" />
      </Text>
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
        {multipleFiles && <FormattedMessage id="post-save-message-files" />}
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

interface PostSaveDialogFooterProps {
  dialogNormallyHidden: boolean;
  onClose: () => void;
  onCloseDontShowAgain: () => void;
}

const PostSaveDialogFooter = ({
  dialogNormallyHidden,
  onClose,
  onCloseDontShowAgain,
}: PostSaveDialogFooterProps) => {
  return (
    <HStack spacing={2.5} width={dialogNormallyHidden ? "auto" : "100%"}>
      {!dialogNormallyHidden && (
        <Link
          onClick={onCloseDontShowAgain}
          as="button"
          color="brand.500"
          mr="auto"
        >
          <FormattedMessage id="dont-show-again" />
        </Link>
      )}
      <Button onClick={onClose} variant="solid" size="md">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

export default PostSaveDialog;

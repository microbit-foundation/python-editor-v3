/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Icon, Image, Link, Text } from "@microbit/ui";
import { ReactNode, useCallback } from "react";
import { RiDownload2Line, RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { Box, Flex, HStack, VStack } from "styled-system/jsx";
import { GenericDialog } from "../../common/GenericDialog";
import SaveButton from "../../project/SaveButton";
import { ConnectErrorChoice } from "./FirmwareDialog";
import notFound from "./not-found.svg";
import { FinalFocusRef } from "../../project/project-actions";

interface NotFoundDialogProps {
  callback: (value: ConnectErrorChoice) => void;
  finalFocusRef: FinalFocusRef;
}

export const NotFoundDialog = ({
  callback,
  finalFocusRef,
}: NotFoundDialogProps) => {
  const onTryAgain = useCallback(() => {
    callback(ConnectErrorChoice.TRY_AGAIN);
  }, [callback]);
  const onSave = useCallback(() => {
    callback(ConnectErrorChoice.CANCEL);
  }, [callback]);
  return (
    <GenericDialog
      finalFocusRef={finalFocusRef}
      onClose={() => callback(ConnectErrorChoice.CANCEL)}
      body={<NotFoundDialogBody onSave={onSave} onTryAgain={onTryAgain} />}
      footer={
        <NotFoundDialogFooter
          onTryAgain={onTryAgain}
          onCancel={() => callback(ConnectErrorChoice.CANCEL)}
        />
      }
      size="3xl"
    />
  );
};

interface ConnectNotFoundDialogProps {
  onSave: () => void;
  onTryAgain: () => void;
}

const NotFoundDialogBody = ({
  onSave,
  onTryAgain,
}: ConnectNotFoundDialogProps) => {
  const handleReviewDevice = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onTryAgain();
    },
    [onTryAgain]
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
      <Text as="h2" fontSize="xl" fontWeight="semibold">
        <FormattedMessage id="not-found-title" />
      </Text>
      <Text>
        <FormattedMessage id="not-found-message" />
      </Text>
      <HStack gap="6">
        <Image height="150px" width="178px" src={notFound} alt="" />
        <VStack alignItems="flex-start" gap="5">
          <VStack alignItems="flex-start">
            <Text>
              <FormattedMessage
                id="not-found-checklist-one"
                values={{
                  link: (chunks: ReactNode) => (
                    <Link
                      color="brand.500"
                      onClick={handleReviewDevice}
                      href=""
                    >
                      {chunks}
                    </Link>
                  ),
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
                id="not-found-checklist-two"
                values={{
                  link: (chunks: ReactNode) => (
                    <Link
                      color="brand.500"
                      display="inline-flex"
                      alignItems="center"
                      target="_blank"
                      rel="noreferrer"
                      href="https://microbit.org/get-started/user-guide/firmware/"
                    >
                      {chunks}
                      <Icon as={RiExternalLinkLine} css={{ ml: 1 }} />
                    </Link>
                  ),
                  strong: (chunks: ReactNode) => (
                    <Text as="span" fontWeight="semibold">
                      {chunks}
                    </Text>
                  ),
                }}
              />
            </Text>
          </VStack>
          <Link
            color="brand.500"
            display="inline-flex"
            alignItems="center"
            target="_blank"
            rel="noreferrer"
            href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
          >
            <FormattedMessage id="connect-troubleshoot" />
            <Icon as={RiExternalLinkLine} css={{ ml: 1 }} />
          </Link>
        </VStack>
      </HStack>
      <Flex
        width="100%"
        background="blimpTeal.50"
        alignItems="center"
        py="3"
        px="5"
        borderRadius="xl"
      >
        <Icon
          as={RiDownload2Line}
          css={{ color: "brand.500", h: 6, w: 6, mr: 5 }}
        />
        <Text fontWeight="semibold" mr="auto">
          <FormattedMessage id="not-found-save-message" />
        </Text>
        <Box onClick={onSave}>
          <SaveButton mode="button" />
        </Box>
      </Flex>
    </VStack>
  );
};

interface NotFoundDialogFooterProps {
  onCancel: () => void;
  onTryAgain: () => void;
}

const NotFoundDialogFooter = ({
  onCancel,
  onTryAgain,
}: NotFoundDialogFooterProps) => {
  return (
    <HStack gap="2.5">
      <Button onPress={onCancel} size="lg">
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onPress={onTryAgain} variant="primary" size="lg">
        <FormattedMessage id="try-again-action" />
      </Button>
    </HStack>
  );
};

export default NotFoundDialog;

/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import Icon from "@chakra-ui/icon";
import {
  HStack,
  Image,
  Link,
  ListItem,
  OrderedList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { GenericDialog } from "../../common/GenericDialog";
import notFound from "./not-found.svg";

export const enum NotFoundChoice {
  Retry,
  ReviewDevice,
  Cancel,
}

interface NotFoundDialogProps {
  callback: (value: NotFoundChoice) => void;
}

export const NotFoundDialog = ({ callback }: NotFoundDialogProps) => {
  return (
    <GenericDialog
      onClose={() => callback(NotFoundChoice.Cancel)}
      body={
        <NotFoundDialogBody
          onReviewDevice={() => callback(NotFoundChoice.ReviewDevice)}
          onCancel={() => callback(NotFoundChoice.Cancel)}
        />
      }
      footer={
        <NotFoundDialogFooter
          onRetry={() => callback(NotFoundChoice.Retry)}
          onCancel={() => callback(NotFoundChoice.Cancel)}
        />
      }
      size="3xl"
    />
  );
};

interface ConnectNotFoundDialogProps {
  onCancel: () => void;
  onReviewDevice: () => void;
}

const NotFoundDialogBody = ({ onReviewDevice }: ConnectNotFoundDialogProps) => {
  const handleReviewDevice = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onReviewDevice();
    },
    [onReviewDevice]
  );
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
        <FormattedMessage id="not-found-title" />
      </Text>
      <Text>
        <FormattedMessage id="not-found-message" />
      </Text>
      <HStack spacing={8}>
        <Image height={150} src={notFound} alt="" />
        <VStack>
          <OrderedList
            spacing={5}
            sx={{
              li: { pl: 2 },
            }}
          >
            <ListItem>
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
                }}
              />
            </ListItem>
            <ListItem>
              <FormattedMessage id="not-found-checklist-two" />
            </ListItem>
            <ListItem>
              <FormattedMessage
                id="not-found-checklist-three"
                values={{
                  link: (chunks: ReactNode) => (
                    <Link
                      color="brand.500"
                      target="_blank"
                      rel="noreferrer"
                      href="https://microbit.org/get-started/user-guide/firmware/"
                    >
                      {chunks} <Icon as={RiExternalLinkLine} />
                    </Link>
                  ),
                }}
              />
            </ListItem>
          </OrderedList>
        </VStack>
      </HStack>
      <Link
        color="brand.500"
        target="_blank"
        rel="noreferrer"
        href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
      >
        <FormattedMessage id="connect-troubleshoot" />{" "}
        <Icon as={RiExternalLinkLine} />
      </Link>
    </VStack>
  );
};

interface NotFoundDialogFooterProps {
  onCancel: () => void;
  onRetry: () => void;
}

const NotFoundDialogFooter = ({
  onCancel,
  onRetry,
}: NotFoundDialogFooterProps) => {
  return (
    <HStack spacing={2.5}>
      <Button onClick={onCancel} size="lg">
        <FormattedMessage id="cancel-action" />
      </Button>
      <Button onClick={onRetry} variant="solid" size="lg">
        <FormattedMessage id="try-again-action" />
      </Button>
    </HStack>
  );
};

export default NotFoundDialog;

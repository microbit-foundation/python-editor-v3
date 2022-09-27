/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/modal";
import { Text } from "@chakra-ui/react";
import { ReactNode, useRef } from "react";
import { FormattedMessage } from "react-intl";

export interface ConfirmDialogProps {
  header: ReactNode;
  body: ReactNode;
  actionLabel: string;
  callback: (value: boolean) => void;
}

/**
 * Confirmation dialog.
 */
export const ConfirmDialog = ({
  header,
  body,
  actionLabel,
  callback,
}: ConfirmDialogProps) => {
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen
      leastDestructiveRef={leastDestructiveRef}
      onClose={() => callback(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text as="h2" fontSize="lg" fontWeight="bold">
              {header}
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={leastDestructiveRef} onClick={() => callback(false)}>
              <FormattedMessage id="cancel-action" />
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={() => callback(true)}
              ml={3}
            >
              {actionLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

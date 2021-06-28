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
import { ReactNode, useRef } from "react";
import { FormattedMessage } from "react-intl";

export interface ConfirmDialogParameters {
  header: ReactNode;
  body: ReactNode;
  // This could get a lot more flexible but let's start simple.
  actionLabel: string;
}

export interface ConfirmDialogParametersWithActions
  extends ConfirmDialogParameters {
  header: ReactNode;
  body: ReactNode;
  actionLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface ConfirmDialogProps extends ConfirmDialogParametersWithActions {
  isOpen: boolean;
}

/**
 * Confirmation dialog.
 *
 * Generally not used directly. Prefer the useDialogs hook.
 */
export const ConfirmDialog = ({
  header,
  body,
  actionLabel,
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={leastDestructiveRef}
      onClose={onCancel}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {header}
          </AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={leastDestructiveRef} onClick={onCancel}>
              <FormattedMessage id="cancel" />
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={onConfirm}
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

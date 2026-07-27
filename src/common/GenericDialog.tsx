/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalSize,
} from "@microbit/ui";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { HStack } from "styled-system/jsx";
import { FinalFocusRef } from "../project/project-actions";

export interface GenericDialogProps {
  header?: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  size?: ModalSize;
  onClose: () => void;
  /**
   * Accepted for API compatibility but no longer wired: react-aria restores
   * focus to the trigger on close by default (see the migration playbook,
   * gotcha #15). Use `finalFocusRef` to redirect focus explicitly.
   */
  returnFocusOnClose?: boolean;
  finalFocusRef?: FinalFocusRef;
}

export const GenericDialog = ({
  header,
  body,
  footer,
  size,
  onClose,
  finalFocusRef = undefined,
}: GenericDialogProps) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      size={size}
      isCentered
      finalFocusRef={finalFocusRef}
      contentCss={{ minWidth: "560px" }}
    >
      <ModalCloseButton />
      {header && (
        <ModalHeader level={2} css={{ fontWeight: "bold" }}>
          {header}
        </ModalHeader>
      )}
      <ModalBody>{body}</ModalBody>
      <ModalFooter>{footer}</ModalFooter>
    </Modal>
  );
};

interface GenericDialogFooterProps {
  dialogNormallyHidden: boolean;
  onClose: () => void;
  onCloseDontShowAgain: () => void;
  shownByRequest?: boolean;
}

export const GenericDialogFooter = ({
  dialogNormallyHidden,
  onClose,
  onCloseDontShowAgain,
  shownByRequest = false,
}: GenericDialogFooterProps) => {
  return (
    <HStack
      gap="2.5"
      width={dialogNormallyHidden || shownByRequest ? "auto" : "100%"}
    >
      {!dialogNormallyHidden && !shownByRequest && (
        <Button
          variant="link"
          onPress={onCloseDontShowAgain}
          css={{ color: "brand.500", mr: "auto" }}
        >
          <FormattedMessage id="dont-show-again" />
        </Button>
      )}
      <Button onPress={onClose} variant="primary" size="lg">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

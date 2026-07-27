/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@microbit/ui";
import { ReactNode } from "react";
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
  return (
    <Modal isOpen role="alertdialog" onClose={() => callback(false)}>
      <ModalHeader level={2} css={{ fontSize: "lg", fontWeight: "bold" }}>
        {header}
      </ModalHeader>
      <ModalBody>{body}</ModalBody>
      <ModalFooter>
        {/* Least-destructive initial focus: RAC honours autoFocus within the
            dialog's FocusScope, replacing Chakra's leastDestructiveRef. */}
        <Button autoFocus onPress={() => callback(false)}>
          <FormattedMessage id="cancel-action" />
        </Button>
        <Button variant="warningSolid" onPress={() => callback(true)}>
          {actionLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

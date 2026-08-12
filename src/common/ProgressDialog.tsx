/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Modal, ModalBody, ModalHeader, ProgressBar } from "@microbit/ui";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { VStack } from "styled-system/jsx";

const doNothing = () => {};

export interface ProgressDialogParameters {
  header: ReactNode;
  body?: ReactNode;
  progress?: number;
}

interface ProgressDialogProps extends ProgressDialogParameters {
  isOpen: boolean;
}

/**
 * A progress dialog used for the flashing process.
 */
const ProgressDialog = ({
  isOpen,
  header,
  body,
  progress,
}: ProgressDialogProps) => {
  const intl = useIntl();
  return (
    <Modal
      isOpen={isOpen}
      onClose={doNothing}
      isCentered
      size={body ? "xl" : "md"}
      // A progress dialog can't be dismissed by the user (it closes when the
      // operation finishes and the parent drops isOpen).
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalHeader level={2} css={{ fontSize: "xl", fontWeight: "bold" }}>
        {header}
      </ModalHeader>
      <ModalBody>
        <VStack
          gap="4"
          mb="3"
          width="100%"
          justifyContent="stretch"
          alignItems="flex-start"
        >
          {body}
          <ProgressBar
            value={(progress ?? 0) * 100}
            aria-label={intl.formatMessage({ id: "loading" })}
          />
        </VStack>
      </ModalBody>
    </Modal>
  );
};

export default ProgressDialog;

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ThemeTypings } from "@chakra-ui/styled-system";
import { ReactNode } from "react";
import ModalCloseButton from "./ModalCloseButton";

export interface GenericDialogProps {
  header?: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  size?: ThemeTypings["components"]["Modal"]["sizes"];
  onClose: () => void;
  returnFocusOnClose?: boolean;
}

export const GenericDialog = ({
  header,
  body,
  footer,
  size,
  onClose,
  returnFocusOnClose = true,
}: GenericDialogProps) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      size={size}
      returnFocusOnClose={returnFocusOnClose}
    >
      <ModalOverlay>
        <ModalContent minWidth="560px" my="auto">
          <ModalCloseButton />
          {header && (
            <ModalHeader fontSize="lg" fontWeight="bold">
              {header}
            </ModalHeader>
          )}
          <ModalBody>{body}</ModalBody>
          <ModalFooter>{footer}</ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

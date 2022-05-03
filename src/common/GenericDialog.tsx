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

export interface GenericDialogComponent {
  onClose: () => void;
}

export interface GenericDialogParameters {
  header?: ReactNode;
  Body: React.FC<GenericDialogComponent>;
  Footer: React.FC<GenericDialogComponent>;
  size?: ThemeTypings["components"]["Modal"]["sizes"];
}

export interface GenericDialogParametersWithActions
  extends GenericDialogParameters {
  onCancel: () => void;
}

export interface GenericDialogProps extends GenericDialogParametersWithActions {
  isOpen: boolean;
}

export const GenericDialog = ({
  header,
  Body,
  Footer,
  isOpen,
  size,
  onCancel,
}: GenericDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size={size}>
      <ModalOverlay>
        <ModalContent minWidth="560px" my="auto">
          <ModalCloseButton />
          {header && (
            <ModalHeader fontSize="lg" fontWeight="bold">
              {header}
            </ModalHeader>
          )}
          <ModalBody>
            <Body onClose={onCancel} />
          </ModalBody>
          <ModalFooter>
            <Footer onClose={onCancel} />
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

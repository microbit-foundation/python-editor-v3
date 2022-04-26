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
  ignoreLocalStorage?: boolean;
}

export interface GenericDialogParameters {
  header?: ReactNode;
  Body: React.FC<GenericDialogComponent>;
  Footer: React.FC<GenericDialogComponent>;
  size?: ThemeTypings["components"]["Modal"]["sizes"];
  ignoreLocalStorage?: boolean;
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
  ignoreLocalStorage,
}: GenericDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size={size}>
      <ModalOverlay>
        <ModalContent minWidth="560px">
          <ModalCloseButton />
          {header && (
            <ModalHeader fontSize="lg" fontWeight="bold">
              {header}
            </ModalHeader>
          )}
          <ModalBody>
            <Body
              onClose={onCancel}
              ignoreLocalStorage={!!ignoreLocalStorage}
            />
          </ModalBody>
          <ModalFooter>
            <Footer
              onClose={onCancel}
              ignoreLocalStorage={!!ignoreLocalStorage}
            />
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

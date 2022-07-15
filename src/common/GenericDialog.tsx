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
import { Button, HStack, Link } from "@chakra-ui/react";
import { ThemeTypings } from "@chakra-ui/styled-system";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
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

interface GenericDialogFooterProps {
  dialogNormallyHidden: boolean;
  onClose: () => void;
  onCloseDontShowAgain: () => void;
}

export const GenericDialogFooter = ({
  dialogNormallyHidden,
  onClose,
  onCloseDontShowAgain,
}: GenericDialogFooterProps) => {
  return (
    <HStack spacing={2.5} width={dialogNormallyHidden ? "auto" : "100%"}>
      {!dialogNormallyHidden && (
        <Link
          onClick={onCloseDontShowAgain}
          as="button"
          color="brand.500"
          mr="auto"
        >
          <FormattedMessage id="dont-show-again" />
        </Link>
      )}
      <Button onClick={onClose} variant="solid" size="lg">
        <FormattedMessage id="close-action" />
      </Button>
    </HStack>
  );
};

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
import { Button, HStack, Link, Text } from "@chakra-ui/react";
import { ThemingProps } from "@chakra-ui/styled-system";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import ModalCloseButton from "./ModalCloseButton";
import { FinalFocusRef } from "../project/project-actions";

export interface GenericDialogProps {
  header?: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  size?: ThemingProps<"Button">["size"];
  onClose: () => void;
  returnFocusOnClose?: boolean;
  finalFocusRef?: FinalFocusRef;
}

export const GenericDialog = ({
  header,
  body,
  footer,
  size,
  onClose,
  returnFocusOnClose = true,
  finalFocusRef = undefined,
}: GenericDialogProps) => {
  return (
    <Modal
      isOpen
      onClose={onClose}
      size={size}
      returnFocusOnClose={returnFocusOnClose}
      finalFocusRef={finalFocusRef}
    >
      <ModalOverlay>
        <ModalContent minWidth="560px" my="auto">
          <ModalCloseButton />
          {header && (
            <ModalHeader>
              <Text as="h2" fontSize="xl" fontWeight="bold">
                {header}
              </Text>
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
      spacing={2.5}
      width={dialogNormallyHidden || shownByRequest ? "auto" : "100%"}
    >
      {!dialogNormallyHidden && !shownByRequest && (
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

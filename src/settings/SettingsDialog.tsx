/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { FormattedMessage } from "react-intl";
import SettingsArea from "./SettingsArea";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * Settings dialog.
 */
export const SettingsDialog = ({
  isOpen,
  onClose,
  finalFocusRef = undefined,
}: SettingsDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      finalFocusRef={finalFocusRef}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            <FormattedMessage id="settings" />
          </ModalHeader>
          <ModalBody>
            <SettingsArea />
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" onClick={onClose}>
              <FormattedMessage id="close-action" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

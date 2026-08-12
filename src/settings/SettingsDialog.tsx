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
      <ModalHeader css={{ fontSize: "lg", fontWeight: "bold" }}>
        <FormattedMessage id="settings" />
      </ModalHeader>
      <ModalBody>
        <SettingsArea />
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onPress={onClose}>
          <FormattedMessage id="close-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

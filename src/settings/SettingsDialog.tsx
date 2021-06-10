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
}

/**
 * Settings dialog.
 */
export const SettingsDialog = ({ isOpen, onClose }: SettingsDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
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
              <FormattedMessage id="close-button" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

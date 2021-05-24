import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
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
            Settings
          </ModalHeader>
          <ModalBody>
            <SettingsArea />
          </ModalBody>
          <ModalFooter>
            <Button variant="solid" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

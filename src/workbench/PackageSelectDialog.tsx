import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React from "react";
import Placeholder from "../common/Placeholder";

interface PackageSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A placeholder package selection dialog.
 */
const PackageSelectDialog = ({ isOpen, onClose }: PackageSelectDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} size="4xl">
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Select a package</ModalHeader>
      <ModalCloseButton />
      <ModalBody minHeight="50vh">
        <Placeholder />
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" mr={3} onClick={onClose}>
          Close
        </Button>
        <Button disabled variant="ghost">
          Add
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default PackageSelectDialog;

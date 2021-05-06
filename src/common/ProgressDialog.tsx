import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Progress } from "@chakra-ui/progress";
import { ReactNode } from "react";

const doNothing = () => {};

export interface ProgressDialogParameters {
  header: ReactNode;
  progress: number | undefined;
}

interface ProgressDialogProps extends ProgressDialogParameters {
  isOpen: boolean;
}

const ProgressDialog = ({ header, progress }: ProgressDialogProps) => {
  return (
    <Modal isOpen={progress !== undefined} onClose={doNothing} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody>
          <Progress min={0} max={1} value={progress} mb={3} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProgressDialog;

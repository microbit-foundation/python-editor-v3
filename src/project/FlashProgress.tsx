import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Progress } from "@chakra-ui/progress";

const doNothing = () => {};

interface FlashProgressProps {
  progress: number | undefined;
}

const FlashProgress = ({ progress }: FlashProgressProps) => {
  return (
    <Modal isOpen={progress !== undefined} onClose={doNothing} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Flashing code</ModalHeader>
        <ModalBody>
          <Progress value={progress! * 100} mb={3} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FlashProgress;

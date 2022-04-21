/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/modal";
import { HStack, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import ModalCloseButton from "../../common/ModalCloseButton";
import { useProjectActions } from "../../project/project-hooks";

interface NotFoundDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotFoundDialog = ({ isOpen, onClose }: NotFoundDialogProps) => {
  const actions = useProjectActions();
  const handleTryAgain = () => {
    onClose();
    actions.connect();
  };
  const buttonWidth = "8.1rem";
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              width="auto"
              ml="auto"
              mr="auto"
              p={8}
              pt={10}
              pb={0}
              spacing={5}
              alignItems="flex-start"
            >
              <Text as="h2" fontSize="xl" fontWeight="semibold">
                No micro:bit found
              </Text>
              <Text>
                You didn’t select a micro:bit, or there was a problem connecting
                to it.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2.5}>
              <Button onClick={onClose} size="lg" minWidth={buttonWidth}>
                <FormattedMessage id="cancel-action" />
              </Button>
              <Button
                onClick={handleTryAgain}
                variant="solid"
                size="lg"
                minWidth={buttonWidth}
              >
                <FormattedMessage id="try-again-action" />
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default NotFoundDialog;

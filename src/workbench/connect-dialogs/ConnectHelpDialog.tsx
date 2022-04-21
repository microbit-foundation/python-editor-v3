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
import { HStack, Image, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import ModalCloseButton from "../../common/ModalCloseButton";
import { useProjectActions } from "../../project/project-hooks";
import connectGif from "./connect.gif";

interface ConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectDialog = ({ isOpen, onClose }: ConnectDialogProps) => {
  const actions = useProjectActions();
  const handleStart = () => {
    onClose();
    actions.connect();
  };
  const buttonWidth = "8.1rem";
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
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
                Connect your micro:bit
              </Text>
              <Text>
                Once you have connected your micro:bit with the editor, you can
                program (“flash”) it directly, and see errors or output from the
                micro:bit in the serial window.
              </Text>
              <Image height="100%" src={connectGif} alt="" />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2.5}>
              <Button onClick={onClose} size="lg" minWidth={buttonWidth}>
                <FormattedMessage id="cancel-action" />
              </Button>
              <Button
                onClick={handleStart}
                variant="solid"
                size="lg"
                minWidth={buttonWidth}
              >
                <FormattedMessage id="start-action" />
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default ConnectDialog;

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
import { Code, Kbd, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

interface SerialHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Settings dialog.
 */
export const SerialHelpDialog = ({
  isOpen,
  onClose,
}: SerialHelpDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            Serial hints and tips
          </ModalHeader>
          <ModalBody>
            <VStack spacing={5} alignItems="stretch">
              <Text>
                The serial terminal shows errors and other output from the
                program running on your micro:bit. By default, it shows the most
                recent error from the program. Expand it to see all the output.
              </Text>
              <Text>
                Your program can print messages using the <Code>print</Code>{" "}
                function. Try adding <Code>print('micro:bit is awesome')</Code>{" "}
                to your program.
              </Text>
              <Text>
                Use the keyboard shortcut <Kbd>Ctrl</Kbd> + <Kbd>C</Kbd> to
                interrupt your program. Then you can type Python commands for
                MicroPython to run. It's a great way to experiment with
                something new.
              </Text>
              <Text>
                To start your program running again use <Kbd>Ctrl</Kbd> +{" "}
                <Kbd>D</Kbd>.
              </Text>
            </VStack>
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

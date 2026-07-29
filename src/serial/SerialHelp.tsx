/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Code,
  Kbd,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface SerialHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef?: React.RefObject<HTMLButtonElement>;
  /**
   * The intro paragraph message id, so the help can refer to the micro:bit or
   * the simulator depending on which serial area it was launched from.
   */
  introId?: string;
}

const formatValues = {
  code: (chunks: ReactNode) => <Code>{chunks}</Code>,
  kbd: (chunks: ReactNode) => <Kbd>{chunks}</Kbd>,
};

/**
 * Serial help triggered from the info icon.
 */
export const SerialHelpDialog = ({
  isOpen,
  onClose,
  finalFocusRef = undefined,
  introId = "serial-help-intro",
}: SerialHelpDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      finalFocusRef={finalFocusRef}
      preserveScrollBarGap={false}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            <FormattedMessage id="serial-help-title" />
          </ModalHeader>
          <ModalBody>
            <VStack spacing={5} alignItems="stretch">
              <Text>
                <FormattedMessage id={introId} />
              </Text>
              <Text>
                <FormattedMessage
                  id="serial-help-print"
                  values={formatValues}
                />
              </Text>
              <Text>
                <FormattedMessage
                  id="serial-help-ctrl-c"
                  values={formatValues}
                />
              </Text>
              <Text>
                <FormattedMessage
                  id="serial-help-ctrl-d"
                  values={formatValues}
                />
              </Text>
            </VStack>
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

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
import { HStack, Image, Link, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import ModalCloseButton from "../../common/ModalCloseButton";
import { useProjectActions } from "../../project/project-hooks";
import firmwareUpgrade from "./firmware-upgrade.png";

interface FirmwareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const FirmwareDialog = ({ isOpen, onClose }: FirmwareDialogProps) => {
  const actions = useProjectActions();
  const handleTryAgain = () => {
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
                Firmware update required
              </Text>
              <Text>
                Connecting to the micro:bit failed because the firmware on your
                micro:bit is too old
              </Text>
              <HStack spacing={8}>
                <Image height={150} src={firmwareUpgrade} alt="" />
                <VStack spacing={5}>
                  <Text>
                    You must{" "}
                    <Link
                      color="brand.500"
                      textDecoration="underline"
                      target="_blank"
                      rel="noreferrer"
                      href="https://microbit.org/firmware/"
                    >
                      update your firmware
                    </Link>{" "}
                    before you can connect to this micro:bit.
                  </Text>
                  <VStack px={5} width="100%" alignItems="flex-start">
                    <Text fontSize="sm">
                      Your firmware version: 0241 (estimated)
                    </Text>
                    <Text fontSize="sm">You need at least: 0249</Text>
                  </VStack>
                </VStack>
              </HStack>
              <Link
                color="brand.500"
                textDecoration="underline"
                target="_blank"
                rel="noreferrer"
                href="https://support.microbit.org/support/solutions/articles/19000105428-webusb-troubleshooting"
              >
                Troubleshoot problems with connecting to your micro:bit
              </Link>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2.5}>
              <Button onClick={onClose} size="lg" minWidth={buttonWidth}>
                <FormattedMessage id="cancel-action" />
              </Button>
              <Button onClick={handleTryAgain} size="lg" minWidth={buttonWidth}>
                <FormattedMessage id="try-again-action" />
              </Button>
              <Button variant="solid" size="lg" minWidth={buttonWidth}>
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://microbit.org/firmware/"
                >
                  <FormattedMessage id="update-firmware-action" />
                </Link>
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default FirmwareDialog;

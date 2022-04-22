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
import { Box, Flex, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { useCallback } from "react";
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
  const handleStart = useCallback(async () => {
    onClose();
    await actions.connect();
  }, [actions, onClose]);
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
              p={[0, 0, 8]}
              pt={[5, 5, 10]}
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
              <Box position="relative" width="100%">
                <Image height="456px" src={connectGif} alt="" />
                <VStack
                  position="absolute"
                  left="515px"
                  top="57px"
                  alignItems="flex-start"
                >
                  <Flex alignItems="center" height="72px">
                    <Text fontSize="xl">Choose your micro:bit</Text>
                  </Flex>
                  <Flex alignItems="center" height="72px">
                    <Text fontSize="xl">Select ‘Connect’</Text>
                  </Flex>
                </VStack>
                <Box position="absolute" top="75px" left="201px">
                  <ArrowOne />
                </Box>
                <Box position="absolute" bottom="50px" left="371px">
                  <ArrowTwo />
                </Box>
              </Box>
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

const ArrowOne = () => {
  return (
    <svg
      width="300"
      height="40"
      viewBox="0 0 300 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="35" y="15" width="230" height="10" fill="#7BCDC2" />
      <circle cx="280" cy="20" r="20" fill="#7BCDC2" />
      <path d="M0 19.5L38.25 4.34455V34.6554L0 19.5Z" fill="#7BCDC2" />
      <foreignObject x="260" y="0" width="40" height="40">
        <Box
          height="40px"
          width="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl" color="white">
            1
          </Text>
        </Box>
      </foreignObject>
    </svg>
  );
};

const ArrowTwo = () => {
  return (
    <svg
      width="135"
      height="262"
      viewBox="0 0 135 262"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="13" y="25" width="89" height="10" fill="#7BCDC2" />
      <rect x="13" y="25" width="10" height="209" fill="#7BCDC2" />
      <circle cx="110" cy="30" r="20" fill="#7BCDC2" />
      <path d="M17.5 262L2.34455 223.75H32.6554L17.5 262Z" fill="#7BCDC2" />
      <foreignObject x="90" y="10" width="40" height="40">
        <Box
          height="40px"
          width="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="2xl" color="white">
            2
          </Text>
        </Box>
      </foreignObject>
    </svg>
  );
};

export default ConnectDialog;

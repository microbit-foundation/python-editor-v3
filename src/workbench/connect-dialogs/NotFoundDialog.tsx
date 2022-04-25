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
import {
  HStack,
  Image,
  Link,
  ListItem,
  OrderedList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import ModalCloseButton from "../../common/ModalCloseButton";
import { useProjectActions } from "../../project/project-hooks";
import { useConnectDialogs } from "./connect-dialogs-hooks";
import notFound from "./not-found.png";

interface NotFoundDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotFoundDialog = ({ isOpen, onClose }: NotFoundDialogProps) => {
  const actions = useProjectActions();
  const { connectHelpDisclosure } = useConnectDialogs();
  const handleTryAgain = useCallback(async () => {
    onClose();
    await actions.connect();
  }, [actions, onClose]);
  const handleReviewSelectDevice = useCallback(() => {
    onClose();
    connectHelpDisclosure.onOpen();
  }, [connectHelpDisclosure, onClose]);
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
              <HStack spacing={8}>
                <Image height={150} src={notFound} alt="" />
                <VStack>
                  <OrderedList
                    spacing={5}
                    sx={{
                      li: { pl: 2 },
                    }}
                  >
                    <ListItem>
                      Review{" "}
                      <Link
                        color="brand.500"
                        onClick={handleReviewSelectDevice}
                      >
                        how to select the device
                      </Link>
                    </ListItem>
                    <ListItem>
                      Check your micro:bit is plugged in and powered on
                    </ListItem>
                    <ListItem>
                      If you have a micro:bit V1 you may need to{" "}
                      <Link
                        color="brand.500"
                        target="_blank"
                        rel="noreferrer"
                        href="https://microbit.org/get-started/user-guide/firmware/"
                      >
                        update the firmware
                      </Link>
                    </ListItem>
                  </OrderedList>
                </VStack>
              </HStack>
              <Link
                color="brand.500"
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

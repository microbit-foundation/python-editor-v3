/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Link, List, ListItem, Stack, Text, VStack } from "@chakra-ui/layout";
import { Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/modal";
import ModalCloseButton from "../common/ModalCloseButton";

interface InfoDialogProps {
  isOpen: boolean;
  info?: boolean;
  onClose: () => void;
  switchToInfoDialog: () => void;
}

const InfoDialog = ({
  isOpen,
  onClose,
  switchToInfoDialog,
}: InfoDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              width="auto"
              ml="auto"
              mr="auto"
              pt={10}
              p={8}
              spacing={5}
              alignItems="stretch"
            >
              <Stack spacing={3}>
                <Text fontWeight="semibold">
                  Welcome to the alpha release of the new micro:bit Python
                  editor.
                </Text>
                <Text>
                  This editor will change rapidly and sometimes things will
                  break.
                </Text>
                <Text>What's new:</Text>
                <List listStyleType="disc" listStylePos="outside" pl={8}>
                  <ListItem m={1}>
                    Autocomplete and signature help in the code editor.
                  </ListItem>
                  <ListItem m={1}>
                    Drag and drop code examples from the{" "}
                    <strong>Explore</strong> and <strong>API</strong>{" "}
                    documentation tabs.
                  </ListItem>
                  <ListItem m={1}>A pre-release of Data logging.</ListItem>
                </List>
                <Text>Things to try:</Text>
                <List listStyleType="disc" listStylePos="outside" pl={8}>
                  <ListItem m={1}>
                    Connecting your micro:bit via WebUSB. Click{" "}
                    <strong>Connect</strong>. Check out Serial once you're
                    connected. You can see any errors on your micro:bit in the
                    serial area.
                  </ListItem>
                  <ListItem m={1}>
                    As-you-type error markers in the code editor. Catch problems
                    before running your program.
                  </ListItem>
                </List>
              </Stack>
              <VStack spacing={4} alignSelf="center" alignItems="stretch">
                <Button size="lg" onClick={switchToInfoDialog}>
                  Feedback
                </Button>
                <Button
                  variant="solid"
                  as={Link}
                  size="lg"
                  href="https://python.microbit.org"
                  sx={{
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                >
                  Stable editor
                </Button>
              </VStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default InfoDialog;

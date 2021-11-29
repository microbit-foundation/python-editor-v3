/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Link, List, ListItem, Stack, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/modal";

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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
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
              spacing={8}
              alignItems="stretch"
            >
              <Stack spacing={3.5}>
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
                  <ListItem m={1}>Autocomplete in the code editor.</ListItem>
                  <ListItem m={1}>
                    Explore what Python and your micro:bit can do in the{" "}
                    <strong>Explore</strong> tab.
                  </ListItem>
                  <ListItem m={1}>
                    Look up details of the micro:bit MicroPython API in the{" "}
                    <strong>Reference</strong> tab.
                  </ListItem>
                  <ListItem m={1}>
                    A pre-release of <strong>Data logging</strong>.
                  </ListItem>
                </List>
                <Text>Don't miss:</Text>
                <List listStyleType="disc" listStylePos="outside" pl={8}>
                  <ListItem m={1}>
                    Connecting your micro:bit via WebUSB. Click{" "}
                    <strong>Connect</strong>. Check out Serial once you're
                    connected. You can see any errors on your micro:bit in the
                    serial area.
                  </ListItem>
                  <ListItem m={1}>
                    As-you-type error markers in the editor. Catch problems
                    before running your code.
                  </ListItem>
                </List>
              </Stack>
              <VStack spacing={4} alignSelf="center" alignItems="stretch">
                <Button size="lg" onClick={switchToInfoDialog}>
                  Feedback
                </Button>
                <Button
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

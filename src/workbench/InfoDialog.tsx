/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import {
  Flex,
  Link,
  List,
  ListItem,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { Modal, ModalBody, ModalContent, ModalOverlay } from "@chakra-ui/modal";
import { RiExternalLinkLine, RiFeedbackLine } from "react-icons/ri";
import ModalCloseButton from "../common/ModalCloseButton";
import { useDeployment } from "../deployment";

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
  const { guideLink } = useDeployment();
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
                <Text as="h2" fontSize="xl" fontWeight="semibold">
                  Python Editor V3 beta release
                </Text>
                <Text>
                  The editor has been redesigned to improve support for teaching
                  Python with the micro:bit. We’d love to hear your feedback.
                </Text>
                <Text>Highlights:</Text>
                <List listStyleType="disc" listStylePos="outside" pl={8}>
                  <ListItem m={1}>
                    Working code examples in the <strong>Reference</strong> tab.
                    Drag and drop them into your code.
                  </ListItem>
                  <ListItem m={1}>
                    Autocomplete and parameter help. See the choices available
                    to you as you type.
                  </ListItem>
                  <ListItem m={1}>
                    Error checking in the code editor. Catch problems before
                    running your program.
                  </ListItem>
                </List>
                <Text>
                  To get started, plug in your micro:bit and click{" "}
                  <strong>Connect</strong>.
                </Text>
              </Stack>
              <Flex flexWrap="wrap" gap={3} justifyContent={["center"]}>
                <Button
                  size="lg"
                  onClick={switchToInfoDialog}
                  leftIcon={<RiFeedbackLine />}
                >
                  Feedback
                </Button>
                <Button
                  leftIcon={<RiExternalLinkLine />}
                  variant="solid"
                  as={Link}
                  size="lg"
                  href={guideLink}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    "&:hover": {
                      textDecoration: "none",
                    },
                  }}
                >
                  Guidance
                </Button>
              </Flex>
              <Text fontSize="sm" pt={8}>
                <Link href="https://python.microbit.org/v/2" color="brand.600">
                  Python Editor V2
                </Link>{" "}
                is still supported and will continue to be available.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default InfoDialog;

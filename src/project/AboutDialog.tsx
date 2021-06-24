import { Button } from "@chakra-ui/button";
import { useClipboard } from "@chakra-ui/hooks";
import { HStack, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { RiFileCopy2Line } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { microPythonVersions } from "../fs/micropython";

const versionInfo = [
  { name: "Editor version", value: process.env.REACT_APP_VERSION },
  {
    name: "MicroPython version",
    value: microPythonVersions.map((mpy) => mpy.version).join("/"),
  },
];
const clipboardVersion = versionInfo
  .map((x) => `${x.name} ${x.value}`)
  .join("\n");

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutDialog = ({ isOpen, onClose }: AboutDialogProps) => {
  const { hasCopied, onCopy } = useClipboard(clipboardVersion);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <FormattedMessage id="about" />
          </ModalHeader>
          <ModalBody>
            <ModalCloseButton />
            <VStack spacing={8} padding={5}>
              <Text fontSize="lg" textAlign="center">
                <FormattedMessage id="about-dialog-text" />
              </Text>
              <HStack
                alignSelf="flex-start"
                alignItems="flex-start"
                spacing={8}
              >
                <VStack alignItems="flex-start">
                  {versionInfo.map((v) => (
                    <Text key={v.name}>
                      <Text as="span" fontWeight="semibold">
                        {v.name}:
                      </Text>{" "}
                      {v.value}
                    </Text>
                  ))}
                </VStack>
                <Button icon={<RiFileCopy2Line />} onClick={onCopy}>
                  <FormattedMessage id={hasCopied ? "copied" : "copy"} />
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default AboutDialog;

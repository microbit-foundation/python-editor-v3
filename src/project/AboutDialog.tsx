import { Button } from "@chakra-ui/button";
import { useClipboard } from "@chakra-ui/hooks";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/modal";
import {
  AspectRatio,
  Collapse,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { RiFileCopy2Line } from "react-icons/ri";
import { useDeployment } from "../deployment";
import { microPythonVersions } from "../fs/micropython";
import comicImage from "./comic.png";
import microbitHeartImage from "./microbit-heart.png";
import micropythonLogo from "./micropython.jpeg";
import pythonPoweredLogo from "./python-powered.png";

const versionInfo = [
  { name: "Editor", value: process.env.REACT_APP_VERSION },
  {
    name: "MicroPython",
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
  const deployment = useDeployment();
  const micropythonSection = useDisclosure();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={8} pl={5} pr={5} pt={5}>
              <HStack spacing={4}>
                {deployment.horizontalLogo && (
                  <Flex
                    alignItems="center"
                    justifyContent="flex-end"
                    width="200px"
                    mr={4}
                  >
                    {deployment.horizontalLogo}
                  </Flex>
                )}
                <Flex alignItems="center" justifyContent="flex-end">
                  <Image src={micropythonLogo} alt="MicroPython" />
                </Flex>
                <Flex
                  alignItems="center"
                  justifyContent="flex-end"
                  alt="Python powered"
                >
                  <Image src={pythonPoweredLogo} />
                </Flex>
              </HStack>

              <Text fontSize="lg" textAlign="center">
                Made with love by the{" "}
                <Link
                  color="brand.500"
                  href="https://github.com/microbit-foundation/python-editor-next/graphs/contributors"
                >
                  Micro:bit Educational Foundation and contributors{" "}
                </Link>
              </Text>
              <SimpleGrid columns={[1, 1, 2, 2]} spacing={8} width="100%">
                <Box>
                  <AspectRatio
                    ml="auto"
                    mr="auto"
                    ratio={690 / 562}
                    maxWidth={[388, 388, null, null]}
                  >
                    <Image
                      src={microbitHeartImage}
                      alt="micro:bit board with the 5 by 5 LED grid showing a heart"
                    />
                  </AspectRatio>
                </Box>
                <VStack
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  spacing={4}
                >
                  <Table size="sm">
                    <Tbody>
                      {versionInfo.map((v) => (
                        <Tr key={v.name}>
                          <Td>{v.name}</Td>
                          <Td>{v.value}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <TableCaption color="gray.800" placement="top">
                      Software versions
                    </TableCaption>
                  </Table>
                  <Button
                    leftIcon={<RiFileCopy2Line />}
                    onClick={onCopy}
                    size="md"
                  >
                    {hasCopied ? "Copied" : "Copy"}
                  </Button>
                </VStack>
              </SimpleGrid>
              <Text fontSize="lg">
                The editor depends on{" "}
                <Link
                  color="brand.500"
                  href="https://micropython.org"
                  target="_blank"
                  rel="noopener"
                >
                  MicroPython
                </Link>{" "}
                which is made by Damien George and a community of developers
                around the world.{" "}
                <Button
                  aria-label={
                    micropythonSection.isOpen
                      ? "Read less about MicroPython"
                      : "Read more about MicroPython"
                  }
                  variant="unstyled"
                  height="unset"
                  verticalAlign="unset"
                  fontSize="lg"
                  fontWeight="normal"
                  rightIcon={
                    micropythonSection.isOpen ? (
                      <ChevronUpIcon />
                    ) : (
                      <ChevronDownIcon />
                    )
                  }
                  onClick={micropythonSection.onToggle}
                >
                  {micropythonSection.isOpen ? "Read less" : "Read more"}
                </Button>
              </Text>
            </VStack>
            <Collapse in={micropythonSection.isOpen}>
              {/* Avoid stack spacing here but match space so it doesn't change after the animation */}
              <MicroPythonSection mt={8} pl={5} pr={5} />
            </Collapse>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} variant="solid" size="lg">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

const MicroPythonSection = (props: BoxProps) => (
  <VStack spacing={4} {...props}>
    <AspectRatio ratio={1035 / 423} width="100%">
      <Image
        src={comicImage}
        alt={`Three panel comic titled "MicroPython Rocks" by Mike Rowbit. A cartoon snake introduces Damien, saying "Meet Damien... He created MicroPython.". Two snakes discuss MicroPython. The yellow snake says "MicroPython is designed to work on very small computers." "Like the BBC micro:bit" the purple snake replies." The yellows snake continues "But Python can run anywhere.". The purple snake agrees, saying "Like on this rack of severs that run huge websites". The background behind the snakes shows a server rack.`}
      />
    </AspectRatio>
    <SimpleGrid columns={[1, 1, 1, 2]} spacing={4} textAlign="center">
      <Text fontSize="md">
        MicroPython{" "}
        <Link
          color="brand.500"
          href="https://github.com/bbcmicrobit/micropython"
          target="_blank"
          rel="noopener"
        >
          source code for the micro:bit V1
        </Link>{" "}
        and{" "}
        <Link
          color="brand.500"
          href="https://github.com/microbit-foundation/micropython-microbit-v2"
          target="_blank"
          rel="noopener"
        >
          micro:bit V2
        </Link>{" "}
      </Text>
      <Text fontSize="md">
        <Link
          color="brand.500"
          href="https://ntoll.org/article/story-micropython-on-microbit/"
          target="_blank"
          rel="noopener"
        >
          Learn how MicroPython on the micro:bit came to be{" "}
        </Link>
      </Text>
    </SimpleGrid>
  </VStack>
);

export default AboutDialog;

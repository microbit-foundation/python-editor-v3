/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { useClipboard } from "@chakra-ui/hooks";
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
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/modal";
import {
  AspectRatio,
  Collapse,
  Icon,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tr,
  useDisclosure,
  VisuallyHidden,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiFileCopy2Line, RiGithubFill } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import ExpandCollapseIcon from "../../common/ExpandCollapseIcon";
import ModalCloseButton from "../../common/ModalCloseButton";
import { useDeployment } from "../../deployment";
import { microPythonConfig } from "../../micropython/micropython";
import comicImage from "./comic.png";
import microbitHeartImage from "./microbit-heart.png";
import micropythonLogo from "./micropython.jpeg";
import pythonPoweredLogo from "./python-powered.png";

const versionInfo = [
  {
    name: "Editor",
    value: import.meta.env.VITE_VERSION,
    href: "https://github.com/microbit-foundation/python-editor-v3",
  },
  ...microPythonConfig.versions.map((mpy) => ({
    name: mpy.name,
    value: mpy.version,
    href: mpy.web,
  })),
];

const clipboardVersion = versionInfo
  .map((x) => `${x.name} ${x.value}`)
  .join("\n");

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef: React.RefObject<HTMLButtonElement>;
}

/**
 * An about dialog with credits and version information.
 *
 * Shown via the help menu.
 */
const AboutDialog = ({ isOpen, onClose, finalFocusRef }: AboutDialogProps) => {
  const { hasCopied, onCopy } = useClipboard(clipboardVersion);
  const deployment = useDeployment();
  const micropythonSection = useDisclosure();
  const intl = useIntl();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      finalFocusRef={finalFocusRef}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalBody>
            <ModalCloseButton />
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
                  {/* No need to translate */}
                  <Image src={micropythonLogo} alt="MicroPython" />
                </Flex>
                <Flex alignItems="center" justifyContent="flex-end">
                  <Image
                    src={pythonPoweredLogo}
                    alt={intl.formatMessage({ id: "python-powered" })}
                  />
                </Flex>
              </HStack>

              <Text fontSize="lg" textAlign="center">
                <FormattedMessage
                  id="about-microbit"
                  values={{
                    link: (chunks: ReactNode) => (
                      <Link
                        rel="noopener noreferrer"
                        target="blank"
                        color="brand.500"
                        href="https://github.com/microbit-foundation/python-editor-v3/graphs/contributors"
                      >
                        {chunks}
                      </Link>
                    ),
                  }}
                />
              </Text>
              <SimpleGrid columns={[1, 1, 2, 2]} spacing={5}>
                <Box>
                  <AspectRatio
                    ml="auto"
                    mr="auto"
                    ratio={690 / 562}
                    maxWidth={[303, 303, null, null]}
                  >
                    <Image
                      src={microbitHeartImage}
                      alt={intl.formatMessage({ id: "microbit-hearts-alt" })}
                    />
                  </AspectRatio>
                </Box>
                <VStack alignItems="center" justifyContent="center" spacing={4}>
                  <Table size="sm">
                    <Tbody>
                      {versionInfo.map((v) => (
                        <Tr key={v.name}>
                          <Td>{v.name}</Td>
                          <Td>{v.value}</Td>
                          <Td padding={0}>
                            {/* Move padding so we get a reasonable click target. */}
                            <Link
                              display="block"
                              pl={4}
                              pr={4}
                              pt={2}
                              pb={2}
                              target="_blank"
                              rel="noopener noreferrer"
                              href={v.href}
                            >
                              <Icon as={RiGithubFill} />
                              <VisuallyHidden>GitHub</VisuallyHidden>
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <TableCaption color="gray.800" placement="top">
                      <FormattedMessage id="software-versions" />
                    </TableCaption>
                  </Table>
                  <Button
                    leftIcon={<RiFileCopy2Line />}
                    onClick={onCopy}
                    size="md"
                  >
                    <FormattedMessage
                      id={hasCopied ? "copied" : "copy-action"}
                    />
                  </Button>
                </VStack>
              </SimpleGrid>
              <Text fontSize="lg">
                <FormattedMessage
                  id="about-micropython"
                  values={{
                    link: (chunks: ReactNode) => (
                      <Link
                        color="brand.500"
                        href="https://micropython.org"
                        target="_blank"
                        rel="noopener"
                      >
                        {chunks}
                      </Link>
                    ),
                  }}
                />{" "}
                <Button
                  aria-label={intl.formatMessage({
                    id: micropythonSection.isOpen
                      ? "about-read-less-micropython"
                      : "about-read-more-micropython",
                  })}
                  variant="unstyled"
                  height="unset"
                  verticalAlign="unset"
                  fontSize="lg"
                  fontWeight="normal"
                  rightIcon={
                    <ExpandCollapseIcon open={micropythonSection.isOpen} />
                  }
                  onClick={micropythonSection.onToggle}
                >
                  {intl.formatMessage({
                    id: micropythonSection.isOpen ? "read-less" : "read-more",
                  })}
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
              <FormattedMessage id="close-action" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

const MicroPythonSection = (props: BoxProps) => {
  const intl = useIntl();
  return (
    <VStack spacing={4} {...props}>
      <AspectRatio ratio={1035 / 423} width="100%">
        <Image
          src={comicImage}
          alt={intl.formatMessage({ id: "about-comic" })}
        />
      </AspectRatio>
      <SimpleGrid columns={[1, 1, 1, 2]} spacing={4} textAlign="center">
        <Text fontSize="md">
          <FormattedMessage
            id="micropython-source-code"
            values={{
              linkV1: (chunks: ReactNode) => (
                <Link
                  color="brand.500"
                  href="https://github.com/bbcmicrobit/micropython"
                  target="_blank"
                  rel="noopener"
                >
                  {chunks}
                </Link>
              ),
              linkV2: (_: ReactNode) => (
                <Link
                  color="brand.500"
                  href="https://github.com/microbit-foundation/micropython-microbit-v2"
                  target="_blank"
                  rel="noopener"
                >
                  micro:bit V2
                </Link>
              ),
            }}
          />
        </Text>
        <Text fontSize="md">
          <Link
            color="brand.500"
            href="https://ntoll.org/article/story-micropython-on-microbit/"
            target="_blank"
            rel="noopener"
          >
            <FormattedMessage id="micropython-history" />
          </Link>
        </Text>
      </SimpleGrid>
    </VStack>
  );
};

export default AboutDialog;

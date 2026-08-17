/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Collapse,
  Icon,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
  VisuallyHidden,
} from "@microbit/ui";
import { ReactNode, useCallback, useState } from "react";
import { RiFileCopy2Line, RiGithubFill } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import {
  AspectRatio,
  Box,
  Flex,
  Grid,
  HStack,
  styled,
  VStack,
} from "styled-system/jsx";
import ExpandCollapseIcon from "../../common/ExpandCollapseIcon";
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

// Minimal clipboard hook (the component library has no equivalent).
const useClipboard = (text: string) => {
  const [hasCopied, setHasCopied] = useState(false);
  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(text);
    setHasCopied(true);
    window.setTimeout(() => setHasCopied(false), 1500);
  }, [text]);
  return { hasCopied, onCopy };
};

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
  const [micropythonOpen, setMicropythonOpen] = useState(false);
  const intl = useIntl();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      finalFocusRef={finalFocusRef}
      aria-label={intl.formatMessage({ id: "about" })}
    >
      <ModalCloseButton />
      <ModalBody>
        <VStack gap="8" pl="5" pr="5" pt="5">
          <HStack gap="4">
            {deployment.horizontalLogo && (
              <Flex
                alignItems="center"
                justifyContent="flex-end"
                width="200px"
                mr="4"
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
                    color="fg.link"
                    href="https://github.com/microbit-foundation/python-editor-v3/graphs/contributors"
                  >
                    {chunks}
                  </Link>
                ),
              }}
            />
          </Text>
          <Grid columns={{ base: 1, md: 2 }} gap="5" width="100%">
            <Box>
              <AspectRatio
                ml="auto"
                mr="auto"
                maxWidth={{ base: "303px", md: "unset" }}
                ratio={690 / 562}
              >
                <Image
                  src={microbitHeartImage}
                  alt={intl.formatMessage({ id: "microbit-hearts-alt" })}
                />
              </AspectRatio>
            </Box>
            <VStack alignItems="center" justifyContent="center" gap="4">
              <styled.table css={{ fontSize: "sm" }}>
                <styled.caption
                  color="gray.800"
                  css={{ captionSide: "top", py: "1" }}
                >
                  <FormattedMessage id="software-versions" />
                </styled.caption>
                <styled.tbody>
                  {versionInfo.map((v) => (
                    <styled.tr key={v.name}>
                      <styled.td
                        px="3"
                        py="1"
                        css={{
                          borderBottomWidth: "1px",
                          borderColor: "gray.100",
                        }}
                      >
                        {v.name}
                      </styled.td>
                      <styled.td
                        px="3"
                        py="1"
                        css={{
                          borderBottomWidth: "1px",
                          borderColor: "gray.100",
                        }}
                      >
                        {v.value}
                      </styled.td>
                      <styled.td
                        p="0"
                        css={{
                          borderBottomWidth: "1px",
                          borderColor: "gray.100",
                        }}
                      >
                        {/* Move padding so we get a reasonable click target. */}
                        <Link
                          display="block"
                          pl="4"
                          pr="4"
                          pt="2"
                          pb="2"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={v.href}
                        >
                          <Icon as={RiGithubFill} />
                          <VisuallyHidden>GitHub</VisuallyHidden>
                        </Link>
                      </styled.td>
                    </styled.tr>
                  ))}
                </styled.tbody>
              </styled.table>
              <Button leftIcon={<RiFileCopy2Line />} onPress={onCopy} size="md">
                <FormattedMessage id={hasCopied ? "copied" : "copy-action"} />
              </Button>
            </VStack>
          </Grid>
          <Text fontSize="lg">
            <FormattedMessage
              id="about-micropython"
              values={{
                link: (chunks: ReactNode) => (
                  <Link
                    color="fg.link"
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
                id: micropythonOpen
                  ? "about-read-less-micropython"
                  : "about-read-more-micropython",
              })}
              variant="unstyled"
              css={{
                height: "unset",
                verticalAlign: "unset",
                fontSize: "lg",
                fontWeight: "normal",
              }}
              rightIcon={<ExpandCollapseIcon open={micropythonOpen} />}
              onPress={() => setMicropythonOpen((open) => !open)}
            >
              {intl.formatMessage({
                id: micropythonOpen ? "read-less" : "read-more",
              })}
            </Button>
          </Text>
        </VStack>
        <Collapse isOpen={micropythonOpen}>
          {/* Avoid stack spacing here but match space so it doesn't change after the animation */}
          <MicroPythonSection />
        </Collapse>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onClose} variant="primary" size="lg">
          <FormattedMessage id="close-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const MicroPythonSection = () => {
  const intl = useIntl();
  return (
    <VStack gap="4" mt="8" pl="5" pr="5">
      <AspectRatio width="100%" ratio={1035 / 423}>
        <Image
          src={comicImage}
          alt={intl.formatMessage({ id: "about-comic" })}
        />
      </AspectRatio>
      <Grid columns={{ base: 1, lg: 2 }} gap="4" textAlign="center">
        <Text fontSize="md">
          <FormattedMessage
            id="micropython-source-code"
            values={{
              linkV1: (chunks: ReactNode) => (
                <Link
                  color="fg.link"
                  href="https://github.com/bbcmicrobit/micropython"
                  target="_blank"
                  rel="noopener"
                >
                  {chunks}
                </Link>
              ),
              linkV2: (_: ReactNode) => (
                <Link
                  color="fg.link"
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
            color="fg.link"
            href="https://ntoll.org/article/story-micropython-on-microbit/"
            target="_blank"
            rel="noopener"
          >
            <FormattedMessage id="micropython-history" />
          </Link>
        </Text>
      </Grid>
    </VStack>
  );
};

export default AboutDialog;

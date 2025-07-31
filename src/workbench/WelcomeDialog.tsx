/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { HStack, Link, Stack, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Icon } from "@chakra-ui/react";
import { ReactNode } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import ModalCloseButton from "../common/ModalCloseButton";
import YoutubeVideoEmbed from "../common/YoutubeVideoEmbed";
import { useDeployment } from "../deployment";

interface WelcomeDialogProps {
  youtubeId: string;
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeDialog = ({ youtubeId, isOpen, onClose }: WelcomeDialogProps) => {
  const { guideLink } = useDeployment();
  const intl = useIntl();
  const welcomeVideoAltText = intl.formatMessage({ id: "welcome-video-alt" });
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="outside">
      <ModalOverlay>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              width="auto"
              ml="auto"
              mr="auto"
              p={5}
              pb={0}
              spacing={5}
              alignItems="stretch"
            >
              <Stack spacing={3}>
                <Text as="h2" fontSize="xl" fontWeight="semibold">
                  <FormattedMessage id="welcome-title" />
                </Text>
                <YoutubeVideoEmbed
                  youtubeId={youtubeId}
                  alt={welcomeVideoAltText}
                />
              </Stack>
              <Text>
                <FormattedMessage id="welcome-message" />
              </Text>
              <Text>
                <FormattedMessage
                  id="guide-link"
                  values={{
                    link: (chunks: ReactNode) => (
                      <Link
                        color="brand.500"
                        target="_blank"
                        rel="noreferrer"
                        href={guideLink}
                      >
                        {chunks}{" "}
                        <Icon as={RiExternalLinkLine} verticalAlign="middle" />
                      </Link>
                    ),
                  }}
                />
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2.5}>
              <Button size="lg" variant="solid" onClick={onClose}>
                <FormattedMessage id="start-coding-action" />
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default WelcomeDialog;

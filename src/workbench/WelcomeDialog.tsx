/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Icon,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
} from "@microbit/ui";
import { ReactNode } from "react";
import { RiExternalLinkLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack, Stack, VStack } from "styled-system/jsx";
import DialogHeading from "../common/DialogHeading";
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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalCloseButton />
      <ModalBody>
        <VStack
          width="auto"
          ml="auto"
          mr="auto"
          p="5"
          pb="0"
          gap="5"
          alignItems="stretch"
        >
          <Stack gap="3">
            <DialogHeading>
              <FormattedMessage id="welcome-title" />
            </DialogHeading>
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
                    <Icon
                      as={RiExternalLinkLine}
                      css={{ verticalAlign: "middle" }}
                    />
                  </Link>
                ),
              }}
            />
          </Text>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <HStack gap="2.5">
          <Button size="lg" variant="primary" onPress={onClose}>
            <FormattedMessage id="start-coding-action" />
          </Button>
        </HStack>
      </ModalFooter>
    </Modal>
  );
};

export default WelcomeDialog;

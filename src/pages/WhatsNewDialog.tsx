/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Text,
} from "@microbit/ui";
import { ReactNode, useEffect, useState } from "react";
import { IconType } from "react-icons";
import { RiDownload2Line, RiFolderOpenLine, RiHome4Line } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { HStack, Stack } from "styled-system/jsx";
import { useStorage } from "../common/use-storage";
import { useCookieConsent } from "../deployment";
import { flags } from "../flags";

// Bump this to show the dialog again.
const currentVersion = 1;

interface WhatsNewStorage {
  version: number;
}

const isWhatsNewStorage = (v: unknown): v is WhatsNewStorage =>
  typeof v === "object" && Number.isInteger((v as any).version);

let shownThisPageLoad = false;

/**
 * Lets the editor hold back its welcome video so a new user is not given
 * two dialogs in their first few minutes.
 */
export const wasWhatsNewShownThisPageLoad = (): boolean => shownThisPageLoad;

/**
 * Shown once per browser after cookie consent, to new users as well as
 * returning ones: on shared school machines the change is new to the teacher
 * even when the browser is not.
 *
 * Only the home page uses this, and it is only reachable with the projects
 * database, so iframe mode and the session storage fallback never see it.
 */
export const useWhatsNewDialog = (): [boolean, () => void] => {
  const [stored, setStored] = useStorage(
    "local",
    "whats-new",
    { version: 0 },
    isWhatsNewStorage
  );
  const [isOpen, setIsOpen] = useState(false);
  const cookieConsent = useCookieConsent();
  useEffect(() => {
    if (cookieConsent && !flags.noWelcome && stored.version < currentVersion) {
      setIsOpen(true);
      setStored({ version: currentVersion });
      shownThisPageLoad = true;
    }
  }, [cookieConsent, stored, setStored]);
  return [isOpen, () => setIsOpen(false)];
};

interface WhatsNewDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsNewDialog = ({ isOpen, onClose }: WhatsNewDialogProps) => {
  const intl = useIntl();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalCloseButton />
      <ModalHeader css={{ fontWeight: "bold" }}>
        <FormattedMessage id="whats-new-title" />
      </ModalHeader>
      <ModalBody>
        <Stack gap="5">
          <Point
            icon={RiHome4Line}
            heading={<FormattedMessage id="whats-new-home-heading" />}
          >
            <FormattedMessage id="whats-new-home" />
          </Point>
          <Point
            icon={RiFolderOpenLine}
            heading={<FormattedMessage id="my-projects-row-title" />}
          >
            <FormattedMessage
              id="whats-new-projects"
              values={{
                viewAll: intl.formatMessage({ id: "view-all-projects" }),
              }}
            />
          </Point>
          <Point
            icon={RiDownload2Line}
            heading={<FormattedMessage id="whats-new-copy-heading" />}
          >
            <FormattedMessage id="whats-new-copy" />
          </Point>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" size="lg" onPress={onClose}>
          <FormattedMessage id="get-started-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const Point = ({
  icon,
  heading,
  children,
}: {
  icon: IconType;
  heading: ReactNode;
  children: ReactNode;
}) => (
  <HStack gap="4" alignItems="flex-start">
    <Icon
      as={icon}
      aria-hidden
      css={{ flexShrink: 0, width: 6, height: 6, mt: 0.5, color: "brand.500" }}
    />
    <Stack gap="1">
      <Text as="h3" fontSize="lg" fontWeight="semibold">
        {heading}
      </Text>
      <Text>{children}</Text>
    </Stack>
  </HStack>
);

export default WhatsNewDialog;

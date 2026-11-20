/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Text,
} from "@microbit/ui";
import { RefObject } from "react";
import { FormattedMessage } from "react-intl";
import { Stack } from "styled-system/jsx";

const supportEmail = "support@microbit.org";

const sections = ["what", "why", "when", "questions"] as const;

interface IdeasMovingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef?: RefObject<HTMLButtonElement | null>;
}

const IdeasMovingDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
}: IdeasMovingDialogProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size="lg"
    finalFocusRef={finalFocusRef}
  >
    <ModalCloseButton />
    <ModalHeader css={{ fontWeight: "bold" }}>
      <FormattedMessage id="ideas-moving-title" />
    </ModalHeader>
    <ModalBody>
      <Stack gap="5">
        {sections.map((section) => (
          <Stack key={section} gap="1">
            <Text as="h3" fontSize="lg" fontWeight="semibold">
              <FormattedMessage id={`ideas-moving-${section}-heading`} />
            </Text>
            <Text>
              <FormattedMessage
                id={`ideas-moving-${section}`}
                values={{
                  email: (
                    <Link
                      href={`mailto:${supportEmail}`}
                      color="brand.500"
                      textDecoration="underline"
                    >
                      {supportEmail}
                    </Link>
                  ),
                }}
              />
            </Text>
          </Stack>
        ))}
      </Stack>
    </ModalBody>
    <ModalFooter>
      <Button variant="primary" size="lg" onPress={onClose}>
        <FormattedMessage id="close-action" />
      </Button>
    </ModalFooter>
  </Modal>
);

export default IdeasMovingDialog;

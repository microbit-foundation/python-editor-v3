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
import { ReactNode, RefObject } from "react";
import { FormattedMessage } from "react-intl";
import { Stack } from "styled-system/jsx";
import { useDeployment } from "../../deployment";

const sections = [
  { heading: "ideas-moving-what-heading", body: "ideas-moving-what" },
  { heading: "ideas-moving-why-heading", body: "ideas-moving-why" },
  { heading: "ideas-moving-when-heading", body: "ideas-moving-when" },
] as const;

interface IdeasMovingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  finalFocusRef?: RefObject<HTMLButtonElement | null>;
}

const IdeasMovingDialog = ({
  isOpen,
  onClose,
  finalFocusRef,
}: IdeasMovingDialogProps) => {
  const { supportLink } = useDeployment();
  return (
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
          {sections.map(({ heading, body }) => (
            <Section key={heading} heading={<FormattedMessage id={heading} />}>
              <FormattedMessage id={body} />
            </Section>
          ))}
          {supportLink && (
            <Section
              heading={<FormattedMessage id="ideas-moving-questions-heading" />}
            >
              <FormattedMessage
                id="ideas-moving-questions"
                values={{
                  link: (chunks: ReactNode) => (
                    <Link
                      href={supportLink}
                      target="_blank"
                      rel="noopener"
                      color="brand.500"
                      textDecoration="underline"
                    >
                      {chunks}
                    </Link>
                  ),
                }}
              />
            </Section>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" size="lg" onPress={onClose}>
          <FormattedMessage id="close-action" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const Section = ({
  heading,
  children,
}: {
  heading: ReactNode;
  children: ReactNode;
}) => (
  <Stack gap="1">
    <Text as="h3" fontSize="lg" fontWeight="semibold">
      {heading}
    </Text>
    <Text>{children}</Text>
  </Stack>
);

export default IdeasMovingDialog;

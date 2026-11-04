/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  ListItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  OrderedList,
  Text,
  Tooltip,
} from "@microbit/ui";
import { useRef, useState } from "react";
import { RiQuestionLine } from "react-icons/ri";
import { FormattedMessage, useIntl } from "react-intl";
import { styled, VStack } from "styled-system/jsx";
import CollapsibleButton from "../common/CollapsibleButton";
import { Traceback } from "../device/device-hooks";
import { useProject } from "../project/project-hooks";
import { useSelection } from "../workbench/use-selection";
import {
  explainRuntimeError,
  projectErrorLocation,
} from "./runtime-error-help";

interface RuntimeErrorHelpProps {
  traceback: Traceback;
  compact?: boolean;
  current: boolean;
}

const RuntimeErrorHelp = ({
  traceback,
  compact,
  current,
}: RuntimeErrorHelpProps) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const goToLocation = useRef(false);
  const [, setSelection] = useSelection();
  const { files } = useProject();
  const location = projectErrorLocation(
    traceback,
    files.map((file) => file.name)
  );
  const explanation = explainRuntimeError(traceback.error);
  const close = () => setOpen(false);
  return (
    <>
      <Tooltip
        hasArrow
        placement="top"
        label={intl.formatMessage({ id: "runtime-error-help-action" })}
      >
        <CollapsibleButton
          mode={compact ? "icon" : "button"}
          variant="unstyled"
          css={{
            display: "flex",
            fontWeight: "normal",
            color: "white",
            flexShrink: 0,
          }}
          icon={<RiQuestionLine />}
          text={intl.formatMessage({ id: "runtime-error-help-action" })}
          onPress={() => setOpen(true)}
        />
      </Tooltip>
      <Modal
        isOpen={open}
        onClose={close}
        size="xl"
        onCloseComplete={() => {
          if (goToLocation.current && current && location) {
            // Let the dialog restore focus before the editor takes it.
            requestAnimationFrame(() =>
              setSelection({
                file: location.file,
                location: { line: location.line },
              })
            );
          }
          goToLocation.current = false;
        }}
      >
        <ModalHeader>
          <FormattedMessage id="runtime-error-help-title" />
        </ModalHeader>
        <ModalBody>
          <VStack gap="4" alignItems="stretch">
            <Text>
              <FormattedMessage id={explanation.description} />
            </Text>
            <Text fontWeight="semibold">
              <FormattedMessage id="runtime-error-checks-title" />
            </Text>
            <OrderedList>
              {explanation.steps.map((step) => (
                <ListItem key={step} mb="2">
                  <FormattedMessage id={step} />
                </ListItem>
              ))}
            </OrderedList>
            {!current && (
              <Text>
                <FormattedMessage id="runtime-error-stale" />
              </Text>
            )}
            {current && !location && (
              <Text>
                <FormattedMessage id="runtime-error-no-project-location" />
              </Text>
            )}
            <Text fontWeight="semibold">
              <FormattedMessage id="runtime-error-original" />
            </Text>
            <styled.pre
              whiteSpace="pre-wrap"
              overflowWrap="anywhere"
              fontFamily="code"
              fontSize="sm"
              p="3"
              background="gray.75"
              borderRadius="md"
            >
              {[
                "Traceback (most recent call last):",
                ...traceback.trace.map((line) => `  ${line}`),
                traceback.error,
              ].join("\n")}
            </styled.pre>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onPress={close}>
            <FormattedMessage id="close-action" />
          </Button>
          {current && location && (
            <Button
              variant="primary"
              onPress={() => {
                goToLocation.current = true;
                close();
              }}
            >
              <FormattedMessage
                id="runtime-error-open-location"
                values={location}
              />
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default RuntimeErrorHelp;

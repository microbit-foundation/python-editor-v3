/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ListItem, OrderedList, Text } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import { VStack } from "styled-system/jsx";
import {
  circuitPythonTransferPhases,
  CircuitPythonTransferProgress as TransferProgress,
} from "../device/web-file-system-device";

const CircuitPythonTransferProgress = ({
  phase,
  completed,
  total,
}: TransferProgress) => {
  const current = circuitPythonTransferPhases.indexOf(phase);
  return (
    <VStack gap="3" alignItems="stretch" width="100%">
      <OrderedList>
        {circuitPythonTransferPhases.map((step, index) => (
          <ListItem
            key={step}
            aria-current={step === phase ? "step" : undefined}
            fontWeight={step === phase ? "bold" : "normal"}
            mb="1"
          >
            {index < current ? "✓ " : ""}
            <FormattedMessage id={`transfer-phase-${step}`} />
          </ListItem>
        ))}
      </OrderedList>
      <Text role="status" aria-live="polite">
        {phase === "files" ? (
          <FormattedMessage
            id="transfer-files-count"
            values={{ completed, total }}
          />
        ) : (
          <FormattedMessage id={`transfer-detail-${phase}`} />
        )}
      </Text>
    </VStack>
  );
};
export default CircuitPythonTransferProgress;

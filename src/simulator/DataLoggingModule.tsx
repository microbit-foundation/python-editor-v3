/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Icon, Text } from "@microbit/ui";
import { ReactNode, useCallback, useMemo } from "react";
import { RiDownload2Line, RiErrorWarningLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { css } from "styled-system/css";
import { Box, HStack, Stack, styled, VStack } from "styled-system/jsx";
import { DataLog } from "../device/simulator";
import { useLogging } from "../logging/logging-hooks";
import { useDataLog } from "./data-logging-hooks";
import { useAutoScrollToBottom } from "./scroll-hooks";
import { saveAs } from "file-saver";

export interface DataLoggingModuleProps {
  icon: ReactNode;
  logFull: boolean;
  minimised: boolean;
}

interface TruncatedDataLog extends DataLog {
  truncated: boolean;
}

// Chakra's striped table (blackAlpha) approximated on a plain table.
const cellClass = css({
  p: "1.5",
  whiteSpace: "nowrap",
});

const DataLoggingModule = ({
  icon,
  logFull,
  minimised,
}: DataLoggingModuleProps) => {
  const untruncatedDataLog = useDataLog();
  const truncatedDataLog = useMemo((): TruncatedDataLog => {
    const limit = 200;
    const truncated = untruncatedDataLog.data.length > limit;
    return {
      headings: untruncatedDataLog.headings,
      data: truncated
        ? untruncatedDataLog.data.slice(-limit)
        : untruncatedDataLog.data,
      truncated,
    };
  }, [untruncatedDataLog]);
  const [ref, handleScroll] = useAutoScrollToBottom(truncatedDataLog);
  const logging = useLogging();
  const handleSaveLog = useCallback(() => {
    const blob = new Blob([toCsv(untruncatedDataLog)], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "simulated-log-data.csv");
    logging.event({
      type: "sim-user-data-log-saved",
    });
  }, [logging, untruncatedDataLog]);
  if (minimised) {
    return (
      <HStack gap="3">
        {icon}
        <Text>
          <FormattedMessage
            id="simulator-data-logging-rows"
            values={{ count: untruncatedDataLog.data.length }}
          />
        </Text>
      </HStack>
    );
  }
  const hasContent = truncatedDataLog.headings.length > 0;
  return (
    <Stack gap="3">
      <Box
        h="2xs"
        bgColor="white"
        borderRadius="md"
        display={hasContent ? "block" : "flex"}
        overflowY="auto"
        overflowX="auto"
        ref={ref}
        onScroll={handleScroll}
        scrollBehavior="smooth"
      >
        {hasContent ? (
          <styled.table position="relative" width="100%">
            <styled.thead>
              <styled.tr>
                {truncatedDataLog.headings.map((heading) => (
                  <styled.th
                    px="1.5"
                    py="1.5"
                    key={heading}
                    color="gray.800"
                    position="sticky"
                    top="0"
                    bgColor="white"
                    // More important to match the user's Python
                    textTransform="none"
                    fontSize="sm"
                    textAlign="start"
                  >
                    {heading}
                  </styled.th>
                ))}
              </styled.tr>
            </styled.thead>
            <styled.tbody
              className={css({
                // Chakra Table variant="striped" colorScheme="blackAlpha".
                "& tr:nth-of-type(odd) td": { background: "blackAlpha.100" },
              })}
            >
              {truncatedDataLog.truncated && (
                <styled.tr key="truncated">
                  <styled.td
                    className={cellClass}
                    colSpan={truncatedDataLog.headings.length}
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    <FormattedMessage id="simulator-data-logging-truncated" />
                  </styled.td>
                </styled.tr>
              )}
              {truncatedDataLog.data.map((row, rowNum) => (
                <styled.tr key={rowNum}>
                  {row.data.map((cell, headingIndex) => {
                    return (
                      <styled.td
                        key={truncatedDataLog.headings[headingIndex]}
                        className={cellClass}
                        fontSize={row.isHeading ? "sm" : undefined}
                        fontWeight={row.isHeading ? "semibold" : undefined}
                        // Chakra's isNumeric.
                        textAlign={row.isHeading ? "start" : "end"}
                        fontFamily={row.isHeading ? undefined : "code"}
                      >
                        {cell}
                      </styled.td>
                    );
                  })}
                </styled.tr>
              ))}
            </styled.tbody>
          </styled.table>
        ) : (
          <VStack flex="1 1 auto" justifyContent="center">
            <Notice>
              <FormattedMessage id="simulator-data-logging-empty" />
            </Notice>
          </VStack>
        )}
      </Box>
      <HStack justifyContent="space-between" fontWeight="semibold">
        <HStack gap="1">
          {logFull && (
            <>
              <Icon as={RiErrorWarningLine} />
              <Text>
                <FormattedMessage id="simulator-data-logging-full" />
              </Text>
            </>
          )}
        </HStack>
        <Button
          leftIcon={<RiDownload2Line />}
          onPress={handleSaveLog}
          isDisabled={!hasContent}
        >
          <FormattedMessage id="simulator-data-logging-save-log" />
        </Button>
      </HStack>
    </Stack>
  );
};

const Notice = ({ children }: { children: ReactNode }) => (
  <Text color="gray.700" p="1">
    {children}
  </Text>
);

// Exported for testing.
export const toCsv = (log: DataLog) => {
  const escape = (content: string): string => {
    if (/[\n\r",]/.test(content)) {
      return `"${content.replaceAll('"', '""')}"`;
    }
    return content;
  };
  const rows = [log.headings, ...log.data.map((d) => d.data)];
  const lines = rows.map((row) => row.map(escape));
  return lines.join("\r\n");
};

export default DataLoggingModule;

/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  HStack,
  Icon,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useCallback, useMemo } from "react";
import { RiDownload2Line, RiErrorWarningLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
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
      <HStack spacing={3}>
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
    <Stack spacing={3}>
      <TableContainer
        h="2xs"
        bgColor="white"
        borderRadius="md"
        display={hasContent ? "block" : "flex"}
        overflowY="auto"
        ref={ref}
        onScroll={handleScroll}
        scrollBehavior="smooth"
      >
        {hasContent ? (
          <Table variant="striped" colorScheme="blackAlpha" position="relative">
            <Thead>
              <Tr>
                {truncatedDataLog.headings.map((heading) => (
                  <Th
                    px={1.5}
                    key={heading}
                    color="gray.800"
                    position="sticky"
                    top={0}
                    bgColor="white"
                    textTransform="unset" // More important to match the user's Python
                    fontSize="sm"
                  >
                    {heading}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {truncatedDataLog.truncated && (
                <Tr key="truncated">
                  <Td
                    p={1.5}
                    colSpan={truncatedDataLog.headings.length}
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    <FormattedMessage id="simulator-data-logging-truncated" />
                  </Td>
                </Tr>
              )}
              {truncatedDataLog.data.map((row, rowNum) => (
                <Tr key={rowNum}>
                  {row.data.map((cell, headingIndex) => {
                    return (
                      <Td
                        key={truncatedDataLog.headings[headingIndex]}
                        p={1.5}
                        fontSize={row.isHeading ? "sm" : undefined}
                        fontWeight={row.isHeading ? "semibold" : undefined}
                        isNumeric={!row.isHeading}
                        fontFamily={row.isHeading ? undefined : "code"}
                      >
                        {cell}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <VStack flex="1 1 auto" justifyContent="center">
            <Notice>
              <FormattedMessage id="simulator-data-logging-empty" />
            </Notice>
          </VStack>
        )}
      </TableContainer>
      <HStack justifyContent="space-between" fontWeight="semibold">
        <HStack spacing={1}>
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
          onClick={handleSaveLog}
          isDisabled={!hasContent}
        >
          <FormattedMessage id="simulator-data-logging-save-log" />
        </Button>
      </HStack>
    </Stack>
  );
};

const Notice = ({ children }: { children: ReactNode }) => (
  <Text color="gray.700" p={1}>
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

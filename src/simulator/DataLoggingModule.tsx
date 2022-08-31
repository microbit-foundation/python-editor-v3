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
import { DataLog, useDataLog } from "./data-logging-hooks";
import { useAutoScrollToBottom } from "./scroll-hooks";

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
  const handleDownload = useCallback(() => {
    const blob = new Blob([toCsv(untruncatedDataLog)], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "simulated-data.csv");
  }, [untruncatedDataLog]);
  if (minimised) {
    return (
      <HStack justifyContent="space-between" width="100%">
        {icon}
        <Text>{untruncatedDataLog.data.length} rows</Text>
        <Button
          size="sm"
          leftIcon={<RiDownload2Line />}
          onClick={handleDownload}
        >
          <FormattedMessage id="download-action" />
        </Button>
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
                  >
                    Older rows not shown
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
                        textTransform={row.isHeading ? "uppercase" : undefined}
                        fontWeight={row.isHeading ? "semibold" : undefined}
                        isNumeric={!row.isHeading}
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
        <Button leftIcon={<RiDownload2Line />} onClick={handleDownload}>
          <FormattedMessage id="simulator-data-logging-download" />
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

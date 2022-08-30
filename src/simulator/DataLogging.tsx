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
import { ReactNode, useCallback } from "react";
import { RiDownload2Line, RiErrorWarningLine } from "react-icons/ri";
import { DataLog, useDataLog } from "./data-logging-hooks";

export interface DataLoggingProps {
  icon: ReactNode;
  logFull: boolean;
  minimised: boolean;
}

const DataLoggingModule = ({ icon, logFull, minimised }: DataLoggingProps) => {
  const dataLog = useDataLog();
  const handleDownload = useCallback(() => {
    const blob = new Blob([toCsv(dataLog)], {
      type: "text/csv;charset=utf-8",
    });
    saveAs(blob, "data-log.csv");
  }, [dataLog]);
  if (minimised) {
    return (
      <HStack justifyContent="space-between" width="100%">
        {icon}
        <Text>{dataLog.data.length} rows</Text>
        <Button
          size="sm"
          leftIcon={<RiDownload2Line />}
          onClick={handleDownload}
        >
          Download
        </Button>
      </HStack>
    );
  }
  const hasContent = dataLog.headings.length > 0;
  return (
    <Stack spacing={3}>
      <TableContainer
        h="2xs"
        bgColor="white"
        borderRadius="md"
        display={hasContent ? "block" : "flex"}
        overflowY="auto"
      >
        {hasContent ? (
          <Table variant="striped" colorScheme="blackAlpha" position="relative">
            <Thead>
              <Tr>
                {dataLog.headings.map((heading) => (
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
              {dataLog.data.map((row, rowNum) => (
                <Tr key={rowNum}>
                  {row.data.map((cell, headingIndex) => {
                    return (
                      <Td
                        key={dataLog.headings[headingIndex]}
                        p={1.5}
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
            <Notice>No log entries.</Notice>
          </VStack>
        )}
      </TableContainer>
      <HStack justifyContent="space-between" fontWeight="semibold">
        <HStack spacing={1}>
          {logFull && (
            <>
              <Icon as={RiErrorWarningLine} />
              <Text>Log full</Text>
            </>
          )}
        </HStack>
        <Button leftIcon={<RiDownload2Line />} onClick={handleDownload}>
          Download data
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

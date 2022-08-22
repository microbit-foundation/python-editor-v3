/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { LogData } from "../simulator";

export interface DataLoggingProps {
  icon: ReactNode;
  sensor: DataLoggingSensorType;
  minimised: boolean;
}

const DataLoggingModule = ({ icon, sensor, minimised }: DataLoggingProps) => {
  const [header, setHeader] = useState<string[]>([]);
  useEffect(() => {
    if (sensor.value.length) {
      if (!header.length) {
        setHeader(sensor.value[0].map((h) => h.key));
      }
      const lastEntryHeader = sensor.value[sensor.value.length - 1].map(
        (l) => l.key
      );
      if (!lastEntryHeader.every((e) => header.includes(e))) {
        // Rebuild header.
        setHeader(Array.from(new Set([...header, ...lastEntryHeader])));
      }
    }
  }, [header, sensor]);

  const isHeaderRow = (log: LogData[]): boolean => {
    const filteredLog = log.filter((l) => l.key !== "timestamp");
    return filteredLog.every((l) => l.value === "");
  };

  return (
    <HStack spacing={3}>
      {minimised ? (
        <HStack justifyContent="space-between" width="100%">
          {icon}
          <Text>{Math.max(sensor.value.length - 1, 0)} rows</Text>
          <Button size="sm">Download</Button>
        </HStack>
      ) : (
        sensor.value && (
          <TableContainer maxH="12rem" overflowY="auto">
            <Table>
              <Thead>
                <Tr>
                  {header.map((header) => (
                    <Th key={header}>{header}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {sensor.value.slice(1, sensor.value.length).map((log, i) => (
                  <Tr key={i}>
                    {header.map((h) => {
                      const valueKey = isHeaderRow(log) ? "key" : "value";
                      const logForHeader = log.find((l) => l.key === h);
                      if (logForHeader) {
                        return (
                          <Td key={logForHeader.key}>
                            {logForHeader.key === "timestamp"
                              ? logForHeader.value
                              : logForHeader[valueKey]}
                          </Td>
                        );
                      } else {
                        return <Td key={h}></Td>;
                      }
                    })}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )
      )}
    </HStack>
  );
};

export default DataLoggingModule;

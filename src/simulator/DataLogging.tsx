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
import sortBy from "lodash.sortby";
import { ReactNode } from "react";
import { DataLoggingSensor as DataLoggingSensorType } from "./model";

export interface DataLoggingProps {
  icon: ReactNode;
  sensor: DataLoggingSensorType;
  minimised: boolean;
}

const DataLoggingModule = ({ icon, sensor, minimised }: DataLoggingProps) => {
  const rank: Record<string, number> = {
    timestamp: 1,
    light: 2,
    temperature: 3,
    sound: 4,
  };
  return (
    <HStack spacing={3}>
      {minimised ? (
        <HStack justifyContent="space-between" width="100%">
          {icon}
          <Text>{sensor.value ? sensor.value.length - 1 : 0} rows</Text>
          <Button size="sm">Download</Button>
        </HStack>
      ) : (
        sensor.value && (
          <TableContainer maxH="12rem" overflowY="auto">
            <Table>
              <Thead>
                <Tr>
                  {sortBy(sensor.value[0], (l) => rank[l.key]).map((header) => (
                    <Th key={header.key}>{header.key}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {sensor.value.slice(1, sensor.value.length).map((log, i) => (
                  <Tr key={i}>
                    {sortBy(log, (l) => rank[l.key]).map((v, i) => (
                      <Td key={v.key}>{v.value}</Td>
                    ))}
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

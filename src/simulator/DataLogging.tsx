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
import { useSimulator } from "../device/device-hooks";
import { EVENT_LOG_DATA, LogEntry } from "../device/simulator";

export interface DataLoggingProps {
  icon: ReactNode;
  logFull: boolean;
  minimised: boolean;
}

interface TableState {
  headers: string[];
  data: string[][];
}

const DataLoggingModule = ({ icon, logFull, minimised }: DataLoggingProps) => {
  const [table, setTable] = useState<TableState>({
    headers: [],
    data: [],
  });
  const simulator = useSimulator();
  useEffect(() => {
    simulator.on(EVENT_LOG_DATA, ({ headers, data }: LogEntry) => {
      setTable((table) => {
        const result: TableState = {
          headers: headers ?? table.headers,
          data: [...table.data],
        };
        if (headers) {
          result.data.push(headers);
        }
        if (data) {
          result.data.push(data);
        }
        return result;
      });
    });
  });

  return (
    <HStack spacing={3}>
      {minimised ? (
        <HStack justifyContent="space-between" width="100%">
          {icon}
          <Text>{table.data.length} rows</Text>
          <Button size="sm">Download</Button>
        </HStack>
      ) : (
        table.headers.length > 0 && (
          <TableContainer maxH="12rem" overflowY="auto">
            <Table>
              <Thead>
                <Tr>
                  {table.headers.map((header) => (
                    <Th key={header}>{header}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {table.data.map((row, i) => (
                  <Tr key={i}>
                    {row.map((cell, index) => {
                      return <Td key={table.headers[i]}>{cell}</Td>;
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

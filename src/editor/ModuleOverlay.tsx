import {
  Box,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { ModuleData } from "../fs/fs-util";
import { SessionSettings } from "../settings/session-settings";
import { WorkbenchSelection } from "../workbench/use-selection";

interface ModuleOverlayProps {
  selection: WorkbenchSelection;
  sessionSettings: SessionSettings;
  setSessionSettings: (sessionSettings: SessionSettings) => void;
  moduleData: ModuleData | undefined;
}

const ModuleOverlay = ({
  selection,
  sessionSettings,
  setSessionSettings,
  moduleData,
}: ModuleOverlayProps) => {
  return (
    <Box height="100%" p={5} pt={0}>
      <VStack
        background="gray.10"
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={5}
      >
        <Text textAlign="center">
          This file is a third-party module and is not intended to be edited.
        </Text>
        {moduleData && (
          <Table width="auto">
            <Tbody>
              <Tr>
                <Th color="grey.800">Module name</Th>
                <Td>{moduleData.name}</Td>
              </Tr>
              <Tr>
                <Th color="grey.800">Module version</Th>
                <Td>{moduleData.version}</Td>
              </Tr>
            </Tbody>
          </Table>
        )}
        <Link
          p={3}
          display="block"
          onClick={() =>
            setSessionSettings({
              ...sessionSettings,
              modulesPermissions: {
                ...sessionSettings.modulesPermissions,
                [selection.file]: {
                  writePermission: true,
                },
              },
            })
          }
          as="button"
          color="brand.500"
        >
          Edit anyway
        </Link>
      </VStack>
    </Box>
  );
};

export default ModuleOverlay;

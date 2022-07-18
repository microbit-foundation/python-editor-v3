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
import { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { useDialogs } from "../common/use-dialogs";
import { ModuleData } from "../fs/fs-util";
import { SettingsDialog } from "../settings/SettingsDialog";

interface ModuleOverlayProps {
  moduleData: ModuleData | undefined;
}

const ModuleOverlay = ({ moduleData }: ModuleOverlayProps) => {
  const dialogs = useDialogs();
  const handleShowSettings = useCallback(() => {
    dialogs.show((callback) => (
      <SettingsDialog isOpen onClose={() => callback(undefined)} />
    ));
  }, [dialogs]);
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
          <FormattedMessage id="third-party-module-explanation" />
        </Text>
        {moduleData && (
          <Table width="auto">
            <Tbody>
              <Tr>
                <Th color="grey.800" scope="row">
                  Module name
                </Th>
                <Td>{moduleData.name}</Td>
              </Tr>
              <Tr>
                <Th color="grey.800" scope="row">
                  Module version
                </Th>
                <Td>{moduleData.version}</Td>
              </Tr>
            </Tbody>
          </Table>
        )}
        <Text py={3}>
          <FormattedMessage
            id="third-party-module-how-to"
            values={{
              link: (chunks: ReactNode) => (
                <Link
                  color="brand.500"
                  as="button"
                  onClick={handleShowSettings}
                >
                  {chunks}
                </Link>
              ),
            }}
          />
        </Text>
      </VStack>
    </Box>
  );
};

export default ModuleOverlay;

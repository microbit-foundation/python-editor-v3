import { Box, Flex, Link, Text, VStack } from "@chakra-ui/react";
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
      <Flex background="gray.10" alignItems="center" height="100%">
        <VStack width="auto" ml="auto" mr="auto" spacing={5} maxWidth="560px">
          {moduleData && (
            <VStack>
              <Text textAlign="center">
                Module name: {moduleData.name}; Version: {moduleData.version}
              </Text>
            </VStack>
          )}
          <Text textAlign="center">
            The code in this file should not be edited. Doing so will likely
            cause errors when using this extension.
          </Text>
          <Link
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
            Continue anyway
          </Link>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ModuleOverlay;

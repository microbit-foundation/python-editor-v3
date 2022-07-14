import { Box, Button, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { MAIN_FILE } from "../fs/fs";
import { SessionSettings } from "../settings/session-settings";
import { WorkbenchSelection } from "../workbench/use-selection";

interface ModuleOverlayProps {
  selection: WorkbenchSelection;
  sessionSettings: SessionSettings;
  setSessionSettings: (sessionSettings: SessionSettings) => void;
  onSelectedFileChanged: (filename: string) => void;
}

const ModuleOverlay = ({
  selection,
  sessionSettings,
  setSessionSettings,
  onSelectedFileChanged,
}: ModuleOverlayProps) => {
  return (
    <Box height="100%" p={5} pt={0}>
      <Flex
        background="var(--chakra-colors-blackAlpha-600)"
        justifyContent="center"
        alignItems="center"
        borderRadius="md"
        height="100%"
      >
        <Box
          backgroundColor="white"
          borderRadius="md"
          maxWidth="560px"
          width="100%"
        >
          <Box px={6} py={2}>
            <VStack
              width="auto"
              ml="auto"
              mr="auto"
              p={5}
              pb={0}
              spacing={5}
              alignItems="flex-start"
            >
              <Text as="h2" fontSize="xl" fontWeight="semibold">
                You shouldn't be here...
              </Text>
              <Text>
                The code in this file should not be edited. Doing so will likely
                cause errors when using this extension. Only proceed if you know
                what you doing.
              </Text>
            </VStack>
          </Box>
          <Box as="footer" px={5} py={6}>
            <HStack spacing={2.5} justifyContent="flex-end">
              <Button
                onClick={() => onSelectedFileChanged(MAIN_FILE)}
                size="md"
              >
                Back to main
              </Button>
              <Button
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
                variant="solid"
                size="md"
              >
                Edit module
              </Button>
            </HStack>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default ModuleOverlay;

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Text } from "@microbit/ui";
import { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { Box, VStack, styled } from "styled-system/jsx";
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
    <Box height="100%" p="5" pt="0">
      <VStack
        background="gray.10"
        alignItems="center"
        justifyContent="center"
        height="100%"
        gap="5"
      >
        <Text textAlign="center">
          <FormattedMessage id="third-party-module-explanation" />
        </Text>
        {moduleData && (
          <styled.table width="auto">
            <styled.tbody>
              <styled.tr>
                <styled.th
                  scope="row"
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  textAlign="start"
                  color="gray.500"
                  px="6"
                  py="3"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  Module name
                </styled.th>
                <styled.td
                  px="6"
                  py="4"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  {moduleData.name}
                </styled.td>
              </styled.tr>
              <styled.tr>
                <styled.th
                  scope="row"
                  textTransform="uppercase"
                  fontSize="xs"
                  fontWeight="bold"
                  letterSpacing="wider"
                  textAlign="start"
                  color="gray.500"
                  px="6"
                  py="3"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  Module version
                </styled.th>
                <styled.td
                  px="6"
                  py="4"
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  {moduleData.version}
                </styled.td>
              </styled.tr>
            </styled.tbody>
          </styled.table>
        )}
        <Text py="3">
          <FormattedMessage
            id="third-party-module-how-to"
            values={{
              link: (chunks: ReactNode) => (
                <Button
                  variant="link"
                  css={{ color: "brand.500" }}
                  onPress={handleShowSettings}
                >
                  {chunks}
                </Button>
              ),
            }}
          />
        </Text>
      </VStack>
    </Box>
  );
};

export default ModuleOverlay;

/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import HomeButton from "../common/HomeButton";
import { useDeployment } from "../deployment";
import SettingsMenu from "../settings/SettingsMenu";
import { createHomePageUrl } from "../urls";
import HelpMenu from "../workbench/HelpMenu";

interface DefaultPageLayoutProps {
  children: ReactNode;
  /** Show a "← Home" button on the left instead of the app branding. */
  showBackToHome?: boolean;
}

const Branding = () => {
  const { AppLogo, OrgLogo } = useDeployment();
  return (
    <HStack
      as={RouterLink}
      to={createHomePageUrl()}
      spacing="0.875rem"
      alignItems="center"
      color="white"
      borderRadius="md"
      _focusVisible={{ boxShadow: "outline", outline: "none" }}
    >
      {OrgLogo && (
        <>
          <OrgLogo height="30px" />
          <Box h="28px" borderLeftWidth="1px" borderColor="whiteAlpha.600" />
        </>
      )}
      {AppLogo && <AppLogo h="20px" />}
    </HStack>
  );
};

/**
 * Simple full-height page layout with a top toolbar and a scrollable body.
 *
 * A pared-down version of the CreateAI layout suitable for this prototype.
 */
const DefaultPageLayout = ({
  children,
  showBackToHome = false,
}: DefaultPageLayoutProps) => {
  return (
    <VStack
      h="100vh"
      w="100%"
      alignItems="stretch"
      spacing={0}
      bgColor="whitesmoke"
      overflow="hidden"
    >
      <HStack
        as="header"
        zIndex={999}
        position="sticky"
        top={0}
        justifyContent="space-between"
        w="100%"
        px={{ base: 3, md: 5 }}
        h="64px"
        flexShrink={0}
        bgColor="brand.500"
        color="white"
      >
        {showBackToHome ? <HomeButton /> : <Branding />}
        <HStack spacing={3}>
          <SettingsMenu size="lg" fontSize="2xl" />
          <HelpMenu size="lg" fontSize="2xl" />
        </HStack>
      </HStack>
      <Flex flexGrow={1} flexDir="column" overflow="auto">
        {children}
      </Flex>
    </VStack>
  );
};

export default DefaultPageLayout;

/**
 * (c) 2024-2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex, Heading, HStack, VStack } from "@chakra-ui/react";
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
  const brand = useDeployment();
  return (
    <HStack
      as={RouterLink}
      to={createHomePageUrl()}
      spacing="0.875rem"
      alignItems="center"
      borderRadius="md"
      _focusVisible={{ boxShadow: "outline", outline: "none" }}
    >
      {brand.squareLogo && (
        <>
          <HStack spacing="0.5rem">
            <Box
              h="30px"
              w="auto"
              color="white"
              role="img"
              display="flex"
              alignItems="center"
              sx={{ "& svg": { height: "100%", width: "auto" } }}
            >
              {brand.squareLogo}
            </Box>
            <Box
              h="30px"
              w="auto"
              color="white"
              role="img"
              display={{ base: "none", sm: "flex" }}
              alignItems="center"
              sx={{ "& svg": { height: "100%", width: "auto" } }}
            >
              {brand.horizontalLogo}
            </Box>
          </HStack>
          <Box h="28px" borderLeftWidth="1px" borderColor="whiteAlpha.600" />
        </>
      )}
      {/* Product name; deliberately not translated. */}
      <Heading as="h1" fontSize="2xl" fontWeight="normal" color="white">
        Python Editor
      </Heading>
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

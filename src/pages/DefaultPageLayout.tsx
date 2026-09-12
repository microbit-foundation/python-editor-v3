/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Button,
  css,
  darkSurface,
  HStack,
  Icon,
  VStack,
} from "@microbit/ui";
import { ReactNode } from "react";
import { RiArrowLeftLine } from "react-icons/ri";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink, useNavigate } from "react-router";
import { styled } from "styled-system/jsx";
import { useDeployment } from "../deployment";
import SettingsMenu from "../settings/SettingsMenu";
import { createHomePageUrl } from "../urls";
import HelpMenu from "../workbench/HelpMenu";

interface DefaultPageLayoutProps {
  children: ReactNode;
  /** A back-to-home button in place of the branding. */
  backToHome?: boolean;
}

const Branding = () => {
  const { squareLogo, horizontalLogo } = useDeployment();
  return (
    <RouterLink
      to={createHomePageUrl()}
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        color: "white",
        borderRadius: "md",
        outline: "none",
        _focusVisible: { focusRing: "outline" },
      })}
    >
      {squareLogo ? (
        <Box width="3.56875rem" role="img" color="white">
          {squareLogo}
        </Box>
      ) : null}
      {horizontalLogo ? (
        <Box width="9.098rem" role="img" color="white">
          {horizontalLogo}
        </Box>
      ) : null}
    </RouterLink>
  );
};

const BackToHomeButton = () => {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      startIcon={<Icon as={RiArrowLeftLine} />}
      onPress={() => void navigate(createHomePageUrl())}
      css={{ color: "white" }}
    >
      <FormattedMessage id="home-action" />
    </Button>
  );
};

/**
 * Full-height page with the brand header and a scrolling body, for the
 * pages outside the editor.
 */
const DefaultPageLayout = ({
  children,
  backToHome = false,
}: DefaultPageLayoutProps) => (
  <VStack
    h="100vh"
    w="100%"
    alignItems="stretch"
    gap={0}
    bg="whitesmoke"
    overflow="hidden"
  >
    <styled.header
      {...darkSurface}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      px={{ base: 3, md: 5 }}
      h="64px"
      flexShrink={0}
      bg="brand.500"
      color="white"
      boxShadow="0px 4px 16px #00000033"
      zIndex={1}
    >
      {backToHome ? <BackToHomeButton /> : <Branding />}
      <HStack gap={3}>
        <SettingsMenu size="lg" />
        <HelpMenu size="lg" />
      </HStack>
    </styled.header>
    <Box flexGrow={1} display="flex" flexDir="column" overflow="auto">
      {children}
    </Box>
  </VStack>
);

export default DefaultPageLayout;

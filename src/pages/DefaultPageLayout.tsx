/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Button, css, darkSurface, HStack, VStack } from "@microbit/ui";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink, useNavigate } from "react-router";
import { styled } from "styled-system/jsx";
import { useDeployment } from "../deployment";
import SettingsMenu from "../settings/SettingsMenu";
import { createHomePageUrl } from "../urls";
import HelpMenu from "../workbench/HelpMenu";
import BackArrow from "./BackArrow";

interface DefaultPageLayoutProps {
  children: ReactNode;
  /** A back-to-home button in place of the branding. */
  backToHome?: boolean;
}

/**
 * Organisation logo, divider, product wordmark, as ml-trainer's header.
 * Sizes are the prototype's; the OSS build has only the wordmark.
 */
const Branding = () => {
  const { AppLogo, OrgLogo } = useDeployment();
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
        userSelect: "none",
        _focusVisible: { focusRing: "outline" },
      })}
    >
      {OrgLogo ? (
        <>
          <OrgLogo h="30px" />
          <Box
            aria-hidden
            h="28px"
            borderLeftWidth="1px"
            borderColor="whiteAlpha.600"
          />
        </>
      ) : null}
      {AppLogo ? <AppLogo h="20px" /> : null}
    </RouterLink>
  );
};

// The pages copy ml-trainer's header, whose buttons are the base preset's
// lg size with a 24px icon. This app's dense preset shrinks lg to 42px
// and the icon to 18px, so the sizes are pinned here. See the dense preset
// discussion in docs/multi-project-plan.md.
const headerButtonCss = { h: "48px", minW: "48px", fontSize: "24px" };

const BackToHomeButton = () => {
  const navigate = useNavigate();
  return (
    <Button
      variant="toolbar"
      startIcon={<BackArrow />}
      onPress={() => void navigate(createHomePageUrl())}
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
        <SettingsMenu size="lg" css={headerButtonCss} />
        <HelpMenu size="lg" css={headerButtonCss} />
      </HStack>
    </styled.header>
    <Box flexGrow={1} display="flex" flexDir="column" overflow="auto">
      {children}
    </Box>
  </VStack>
);

export default DefaultPageLayout;

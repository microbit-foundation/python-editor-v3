/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, IconButton } from "@chakra-ui/react";
import { useCallback } from "react";
import { RiHome2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { createHomePageUrl } from "../urls";
import BackArrow from "./BackArrow";

// Matches the "Learn more" button in the home page banner.
export const homeButtonStyle = {
  backgroundColor: "white",
  border: 0,
  textColor: "brand.700",
  _hover: { textDecoration: "none" },
  _focusVisible: { boxShadow: "outline" },
} as const;

interface HomeButtonProps {
  /** Render as an icon-only button (e.g. when the sidebar is collapsed). */
  iconOnly?: boolean;
}

/**
 * A "← Home" button that navigates to the project list.
 */
const HomeButton = ({ iconOnly }: HomeButtonProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const label = intl.formatMessage({ id: "home-action" });
  const handleClick = useCallback(() => {
    navigate(createHomePageUrl());
  }, [navigate]);

  if (iconOnly) {
    // Collapsed: a plain white home icon (no button fill) reads more clearly.
    return (
      <IconButton
        icon={<RiHome2Line />}
        onClick={handleClick}
        aria-label={label}
        variant="ghost"
        color="white"
        fontSize="3xl"
        _hover={{ bg: "whiteAlpha.300" }}
        _active={{ bg: "whiteAlpha.400" }}
        _focusVisible={{ boxShadow: "outline" }}
      />
    );
  }
  return (
    <Button leftIcon={<BackArrow />} onClick={handleClick} {...homeButtonStyle}>
      {label}
    </Button>
  );
};

export default HomeButton;

/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ButtonProps, IconButton } from "@microbit/ui";
import React, { ForwardedRef } from "react";
import { MdMoreVert } from "react-icons/md";

interface MoreMenuButtonProps {
  "aria-label": string;
  size?: "lg" | "md" | "sm" | "xs";
  variant?: ButtonProps["variant"];
  "data-testid"?: string;
}

/**
 * The "more" half of a split button. Place inside a MenuTrigger, next to the
 * main action button, both inside an attached ButtonGroup.
 */
const MoreMenuButton = React.forwardRef(
  (
    { size, variant, ...props }: MoreMenuButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <IconButton
        ref={ref}
        variant={variant}
        size={size}
        css={{
          borderLeft: "1px solid",
          borderRadius: "button",
          // Nudge the glyph towards the attached (square) edge.
          "& svg": { marginLeft: "calc(-0.15 * token(radii.button))" },
        }}
        {...props}
      >
        <MdMoreVert />
      </IconButton>
    );
  }
);

export default MoreMenuButton;

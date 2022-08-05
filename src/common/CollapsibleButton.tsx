/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  CSSObject,
  HTMLChakraProps,
  IconButton,
  ThemingProps,
} from "@chakra-ui/react";
import React, { ForwardedRef } from "react";

export interface CollapsibleButtonProps
  extends HTMLChakraProps<"button">,
    ThemingProps<"Button"> {
  mode: "icon" | "button";
  text: string;
  icon: React.ReactElement;
  iconRight?: boolean;
  /**
   * Width used only in button mode.
   */
  buttonWidth?: number | string;
  /**
   * Styles used only when collapsed.
   */
  _collapsed?: CSSObject;
}

export type CollapsibleButtonComposableProps = Omit<
  CollapsibleButtonProps,
  "onClick" | "text" | "icon"
>;

/**
 * Button that can be a regular or icon button.
 *
 * We'd like to do this at a lower-level so we can animate a transition.
 */
const CollapsibleButton = React.forwardRef(
  (
    {
      mode,
      text,
      icon,
      iconRight,
      buttonWidth,
      _collapsed,
      ...props
    }: CollapsibleButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return mode === "icon" ? (
      <IconButton
        ref={ref}
        icon={icon}
        aria-label={text}
        {...props}
        sx={_collapsed}
        fontSize="xl"
      />
    ) : (
      <Button
        ref={ref}
        leftIcon={icon && !iconRight ? icon : undefined}
        rightIcon={icon && iconRight ? icon : undefined}
        minWidth={buttonWidth}
        {...props}
      >
        {text}
      </Button>
    );
  }
);

export default CollapsibleButton;

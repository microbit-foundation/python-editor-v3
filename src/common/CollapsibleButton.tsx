/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, ButtonProps, IconButton } from "@microbit/ui";
import React, { ForwardedRef } from "react";
import { SystemStyleObject } from "styled-system/types";

export interface CollapsibleButtonProps
  extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon"> {
  mode: "icon" | "button";
  text: string;
  icon: React.ReactElement;
  iconRight?: boolean;
  "data-testid"?: string;
  /**
   * Styles used only when collapsed.
   */
  _collapsed?: SystemStyleObject;
}

export type CollapsibleButtonComposableProps = Omit<
  CollapsibleButtonProps,
  "onPress" | "text" | "icon"
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
      _collapsed,
      css: cssProp,
      ...props
    }: CollapsibleButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return mode === "icon" ? (
      <IconButton
        ref={ref}
        aria-label={text}
        {...props}
        css={{ fontSize: "xl", ...cssProp, ..._collapsed }}
      >
        {icon}
      </IconButton>
    ) : (
      <Button
        ref={ref}
        leftIcon={icon && !iconRight ? icon : undefined}
        rightIcon={icon && iconRight ? icon : undefined}
        {...props}
        css={cssProp}
      >
        {text}
      </Button>
    );
  }
);

export default CollapsibleButton;

import {
  Button,
  HTMLChakraProps,
  IconButton,
  ThemingProps,
} from "@chakra-ui/react";
import React from "react";

export interface CollapsibleButtonProps
  extends HTMLChakraProps<"button">,
    ThemingProps<"Button"> {
  mode: "icon" | "button";
  text: string;
  icon: React.ReactElement;
  /**
   * Width used only in button mode.
   */
  buttonWidth?: number | string;
}

/**
 * Button that can be a regular or icon button.
 *
 * We'd like to do this at a lower-level so we can animate a transition.
 */
const CollapsableButton = ({
  mode,
  text,
  icon,
  buttonWidth,
  ...props
}: CollapsibleButtonProps) => {
  return mode === "icon" ? (
    <IconButton icon={icon} aria-label={text} {...props} />
  ) : (
    <Button leftIcon={icon} minWidth={buttonWidth} {...props}>
      {text}
    </Button>
  );
};

export default CollapsableButton;

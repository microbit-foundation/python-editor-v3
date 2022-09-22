/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IconButton,
  MenuButton,
  MenuButtonProps,
  ThemeTypings,
} from "@chakra-ui/react";
import React, { ForwardedRef } from "react";
import { MdMoreVert } from "react-icons/md";

interface MoreMenuButtonProps extends MenuButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
  variant?: string;
}

const MoreMenuButton = React.forwardRef(
  (
    { size, variant, ...props }: MoreMenuButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <MenuButton
        ref={ref}
        variant={variant}
        borderLeft="1px"
        borderRadius="button"
        as={IconButton}
        icon={
          <MdMoreVert
            style={{
              marginLeft: "calc(-0.15 * var(--chakra-radii-button))",
            }}
          />
        }
        size={size}
        {...props}
      />
    );
  }
);

export default MoreMenuButton;

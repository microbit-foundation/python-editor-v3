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
import { MdMoreVert } from "react-icons/md";

interface MoreMenuButtonProps extends MenuButtonProps {
  size?: ThemeTypings["components"]["Button"]["sizes"];
  variant?: string;
}

const MoreMenuButton = ({ size, variant, ...props }: MoreMenuButtonProps) => {
  return (
    <MenuButton
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
};

export default MoreMenuButton;

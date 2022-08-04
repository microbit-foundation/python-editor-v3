/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Icon, Tab, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { Pane } from "./SideBar";

interface SideBarTabProps extends Pane {
  color: string;
  mb?: string;
  handleTabClick: () => void;
  active: boolean;
  tabIndex: number;
  cornerSize: number;
  facingDirection: "left" | "right";
  size: "sm" | "lg";
}

const SideBarTab = ({
  id,
  icon,
  title,
  color,
  mb,
  handleTabClick,
  active,
  tabIndex,
  size,
  cornerSize,
  facingDirection,
}: SideBarTabProps) => {
  const width = size === "lg" ? "5rem" : "2.5rem";
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Override tabindex.
    ref.current!.setAttribute("tabindex", "0");
  }, [tabIndex]);
  return (
    <Tab
      ref={ref}
      key={id}
      color={color}
      height={width}
      width={width}
      p={0}
      position="relative"
      className="sidebar-tab" // Used for custom outline below
      onClick={handleTabClick}
      mb={mb ? mb : 0}
      aria-expanded={active ? "true" : "false"}
      borderRadius={
        facingDirection === "right"
          ? `${cornerSize}px 0 0 ${cornerSize}px`
          : `0 ${cornerSize}px ${cornerSize}px 0`
      }
      ml={facingDirection === "left" ? 0 : "6px"}
      mr={facingDirection === "left" ? "6px" : 0}
    >
      <VStack spacing={0}>
        {active && (
          <Corner
            id={size === "sm" ? "sm-bottom" : "lg-bottom"}
            position="absolute"
            bottom={-cornerSize + "px"}
            right={facingDirection === "right" ? 0 : "unset"}
            left={facingDirection === "right" ? "unset" : 0}
            transform={
              facingDirection === "right" ? "rotate(0deg)" : "rotate(270deg)"
            }
            cornerSize={cornerSize}
          />
        )}
        {active && (
          <Corner
            id={size === "sm" ? "sm-top" : "lg-top"}
            position="absolute"
            top={-cornerSize + "px"}
            right={facingDirection === "right" ? 0 : "unset"}
            left={facingDirection === "right" ? "unset" : 0}
            transform={
              facingDirection === "right" ? "rotate(90deg)" : "rotate(180deg)"
            }
            cornerSize={cornerSize}
          />
        )}
        <VStack spacing={1}>
          <Icon boxSize={6} as={icon} mt={size === "lg" ? "3px" : "unset"} />
          {size === "lg" && (
            <Text
              m={0}
              fontSize={13}
              borderBottom="3px solid transparent"
              sx={{
                ".sidebar-tab:focus-visible &": {
                  borderBottom: "3px solid",
                  // To match the active/inactive colour.
                  borderColor: active
                    ? "var(--chakra-colors-brand-300)"
                    : "var(--chakra-colors-gray-25)",
                },
              }}
            >
              {title}
            </Text>
          )}
        </VStack>
      </VStack>
    </Tab>
  );
};

interface CornerProps extends BoxProps {
  cornerSize: number;
}

const Corner = ({ id, cornerSize, ...props }: CornerProps) => {
  return (
    <Box
      {...props}
      pointerEvents="none"
      width={`${cornerSize}px`}
      height={`${cornerSize}px`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${cornerSize} ${cornerSize}`}
        overflow="visible"
        fill="var(--chakra-colors-gray-25)"
      >
        <defs>
          <mask id={id}>
            <rect
              x="0"
              y="0"
              width={cornerSize}
              height={cornerSize}
              fill="#fff"
            />
            <circle r={cornerSize} cx="0" cy={cornerSize} fill="#000" />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={cornerSize}
          height={cornerSize}
          fill="var(--chakra-colors-gray-25)"
          mask={`url(#${id})`}
        />
      </svg>
    </Box>
  );
};

export default SideBarTab;

/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Icon, Text } from "@microbit/ui";
import { CSSProperties, useEffect, useRef } from "react";
import { Tab } from "react-aria-components";
import { css } from "styled-system/css";
import { Box, VStack } from "styled-system/jsx";
import { cornerSize, Pane } from "./SideBar";

interface SideBarTabProps extends Pane {
  color: string;
  mb?: string;
  handleTabClick: (id: Pane["id"]) => void;
  active: boolean;
  tabIndex: number;
}

const SideBarTab = ({
  id,
  icon,
  title,
  color,
  mb,
  handleTabClick,
  active,
}: SideBarTabProps) => {
  const width = "5rem";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Override react-aria's roving tabindex so every tab is tabbable.
    // Has no dependencies as it needs to run for every re-render. The ref
    // is null during react-aria's collection-building pre-render.
    ref.current?.setAttribute("tabindex", "0");
  });
  return (
    <Tab
      ref={ref}
      id={id}
      key={id}
      // Used for the custom focus outline on the title below.
      className={
        "sidebar-tab " +
        css(
          {
            color: color === "gray.50" ? "gray.50" : "gray.75",
            height: width,
            width,
            p: "0",
            position: "relative",
            ml: "6px",
            mb: mb ? "auto" : "0",
            borderRadius: "32px 0 0 32px",
            transition: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "semibold",
            outline: "none",
          },
          // Driven by `active` (index-based) rather than react-aria's
          // data-selected: the collapsed sidebar retains a hidden selection
          // (see SideBar) that must not be styled.
          active
            ? {
                color: "sidebarTabSelectedText",
                bg: "sidebarTabSelectedBg",
              }
            : {}
        )
      }
      onClick={() => handleTabClick(id)}
      aria-expanded={active ? "true" : "false"}
    >
      <VStack gap="0">
        {active && (
          // cornerSize-derived offsets are inline styles: template literals
          // over an imported constant are not statically extractable.
          <Corner
            id="bottom"
            style={{ bottom: `-${cornerSize}px`, right: 0 }}
          />
        )}
        {active && (
          <Corner
            id="top"
            style={{
              top: `-${cornerSize}px`,
              right: 0,
              transform: "rotate(90deg)",
            }}
          />
        )}
        <VStack gap="1">
          <Icon css={{ width: "6", height: "6", mt: "3px" }} as={icon} />
          <Text
            m="0"
            fontSize="13px"
            borderBottom="3px solid transparent"
            css={{
              // Both focus-visible heuristics must agree: native
              // :focus-visible matches pointer clicks on a tabindex'd div
              // in Chromium, and react-aria's data-focus-visible does so in
              // Firefox. Keyboard focus sets both in all modern browsers.
              ".sidebar-tab[data-focus-visible]:focus-visible &": {
                borderBottom: "3px solid",
                // To match the active/inactive colour.
                borderColor: active ? "brand.300" : "gray.75",
              },
            }}
          >
            {title}
          </Text>
        </VStack>
      </VStack>
    </Tab>
  );
};

const Corner = ({ id, style }: { id: string; style?: CSSProperties }) => (
  <Box
    position="absolute"
    pointerEvents="none"
    style={{
      width: cornerSize,
      height: cornerSize,
      ...style,
    }}
  >
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${cornerSize} ${cornerSize}`}
      overflow="visible"
      fill="var(--colors-gray-75)"
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
        fill="var(--colors-gray-75)"
        mask={`url(#${id})`}
      />
    </svg>
  </Box>
);

export default SideBarTab;

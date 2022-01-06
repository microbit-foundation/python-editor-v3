/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps, Icon, Tab, Text, VStack } from "@chakra-ui/react";
import { cornerSize, Pane } from "./SideBar";

interface SideBarTabProps extends Pane {
  color: string;
  mb?: string;
  handleTabClick: () => void;
  active: boolean;
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
  return (
    <Tab
      key={id}
      color={color}
      height={width}
      width={width}
      p={0}
      position="relative"
      className="sidebar-tab" // Used for custom outline below
      onClick={handleTabClick}
      mb={mb ? mb : 0}
    >
      <VStack spacing={0}>
        {active && (
          <Corner
            id="bottom"
            position="absolute"
            bottom={-cornerSize + "px"}
            right={0}
          />
        )}
        {active && (
          <Corner
            id="top"
            position="absolute"
            top={-cornerSize + "px"}
            right={0}
            transform="rotate(90deg)"
          />
        )}
        <VStack spacing={1}>
          <Icon boxSize={6} as={icon} mt="3px" />
          <Text
            m={0}
            fontSize={13}
            borderBottom="3px solid transparent"
            sx={{
              ".sidebar-tab:focus &": {
                // To match the focus outline
                borderBottom: "3px solid rgba(66, 153, 225, 0.6)",
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

const Corner = ({ id, ...props }: BoxProps) => (
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
      fill="var(--chakra-colors-gray-50)"
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
        fill="var(--chakra-colors-gray-50)"
        mask={`url(#${id})`}
      />
    </svg>
  </Box>
);

export default SideBarTab;

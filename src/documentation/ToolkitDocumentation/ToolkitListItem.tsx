/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Box,
  Divider,
  HStack,
  ListItem,
  ListItemProps,
} from "@chakra-ui/layout";

interface ToolkitListItemProps extends ListItemProps {
  showIcon: boolean;
}

const ToolkitListItem = ({
  children,
  showIcon,
  ...props
}: ToolkitListItemProps) => (
  <ListItem {...props}>
    <HStack ml={showIcon ? 3 : 5} mr={3} mt={5} mb={5} spacing={5}>
      {showIcon && (
        <Box
          minWidth="80px"
          height="64px"
          bg="#d7d9dc"
          borderRadius="lg"
          mt={1}
        ></Box>
      )}
      {children}
    </HStack>
    <Divider />
  </ListItem>
);

export default ToolkitListItem;

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Divider,
  HStack,
  ListIcon,
  ListItem,
  ListItemProps,
} from "@chakra-ui/layout";
import { RiCheckboxBlankFill } from "react-icons/ri";

const ToolkitListItem = ({ children, ...props }: ListItemProps) => (
  <ListItem {...props}>
    <HStack ml={3} mr={3} mt={5} mb={5} spacing={0.5}>
      <ListIcon
        as={RiCheckboxBlankFill}
        color="rgb(205, 210, 226)"
        fontSize="3xl"
        alignSelf="flex-start"
      />
      {children}
    </HStack>
    <Divider />
  </ListItem>
);

export default ToolkitListItem;

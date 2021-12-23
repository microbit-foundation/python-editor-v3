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

interface ToolkitListItemProps extends ListItemProps {
  showIcon: boolean;
}

const ToolkitListItem = ({
  children,
  showIcon,
  ...props
}: ToolkitListItemProps) => (
  <ListItem {...props}>
    <HStack ml={showIcon ? 3 : 5} mr={3} mt={5} mb={5} spacing={0.5}>
      {showIcon ? (
        <ListIcon
          as={RiCheckboxBlankFill}
          color="rgb(205, 210, 226)"
          fontSize="3xl"
          alignSelf="flex-start"
        />
      ) : (
        <></>
      )}

      {children}
    </HStack>
    <Divider />
  </ListItem>
);

export default ToolkitListItem;

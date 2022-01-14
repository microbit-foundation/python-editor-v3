/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider, HStack, ListItem, ListItemProps } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
import { ToolkitImage } from "../ToolkitDocumentation/model";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";

interface ToolkitListItemProps extends ListItemProps {
  showIcon: boolean;
  icon?: ToolkitImage;
}

const ToolkitListItem = ({
  children,
  showIcon,
  icon,
  ...props
}: ToolkitListItemProps) => {
  return (
    <ListItem {...props}>
      <HStack ml={showIcon && icon ? 3 : 5} mr={3} mt={5} mb={5} spacing={5}>
        {showIcon && icon && (
          <Image
            src={imageUrlBuilder.image(icon.asset).url()}
            alt="Topic icon"
            width="80px"
            height="64px"
            borderRadius="lg"
            mt={1}
          />
        )}
        {children}
      </HStack>
      <Divider ml={3} borderWidth="1px" />
    </ListItem>
  );
};

export default ToolkitListItem;

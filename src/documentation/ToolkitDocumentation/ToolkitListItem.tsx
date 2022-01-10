/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Divider, HStack, ListItem, ListItemProps } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
import { ToolkitImage } from "../ToolkitDocumentation/model";
import unconfiguredImageUrlBuilder from "@sanity/image-url";

export const defaultQuality = 80;

const imageUrlBuilder = unconfiguredImageUrlBuilder()
  // Hardcoded for now as there's no practical alternative.
  .projectId("ajwvhvgo")
  .dataset("apps")
  .auto("format")
  .dpr(window.devicePixelRatio ?? 1)
  .quality(defaultQuality);

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
      <HStack ml={showIcon ? 3 : 5} mr={3} mt={5} mb={5} spacing={5}>
        {showIcon && icon && (
          <Image
            src={imageUrlBuilder.image(icon.asset).width(80).height(64).url()}
            alt="something"
            width="80px"
            height="64px"
            borderRadius="lg"
            mt={1}
          />
        )}
        {children}
      </HStack>
      <Divider />
    </ListItem>
  );
};

export default ToolkitListItem;

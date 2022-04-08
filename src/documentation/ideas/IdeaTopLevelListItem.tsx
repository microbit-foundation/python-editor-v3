/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { IconButton } from "@chakra-ui/button";
import { VStack } from "@chakra-ui/layout";
import { Divider, HStack, Image, ListItem } from "@chakra-ui/react";
import { RiArrowRightLine } from "react-icons/ri";
import { useIntl } from "react-intl";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import ToolkitName from "../reference/ToolkitName";
import { IdeaImage } from "./model";

interface IdeaTopLevelListItemProps {
  name: string;
  image: IdeaImage;
  isV2Only?: boolean;
  onForward: () => void;
}

const IdeaTopLevelListItem = ({
  name,
  image,
  isV2Only,
  onForward,
}: IdeaTopLevelListItemProps) => {
  const intl = useIntl();
  return (
    <ListItem onClick={onForward} cursor="pointer">
      <HStack m={5} mr={3} spacing={5}>
        <VStack alignItems="stretch" spacing={1} flex="1 1 auto">
          <HStack justifyContent="space-between">
            <ToolkitName name={name} isV2Only={!!isV2Only}></ToolkitName>
            <IconButton
              icon={<RiArrowRightLine />}
              aria-label={intl.formatMessage(
                { id: "toolkit-view-documentation" },
                { name }
              )}
              size="sm"
              color="brand.200"
              variant="ghost"
              fontSize="2xl"
              onClick={onForward}
            />
          </HStack>
          <Image
            src={imageUrlBuilder.image(image.asset).url()}
            alt=""
            width="100%"
          />
        </VStack>
      </HStack>
      <Divider ml={3} borderWidth="1px" />
    </ListItem>
  );
};

export default IdeaTopLevelListItem;

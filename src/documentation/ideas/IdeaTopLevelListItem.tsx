/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { VStack } from "@chakra-ui/layout";
import { HStack, Image, ListItem } from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import ToolkitName from "../reference/ToolkitName";
import { IdeaImage } from "./model";

interface IdeaTopLevelListItemProps {
  name: string;
  image: IdeaImage;
  isV2Only?: boolean;
  onForward: () => void;
  listItemMode: string;
}

const IdeaTopLevelListItem = ({
  name,
  image,
  isV2Only,
  onForward,
  listItemMode,
}: IdeaTopLevelListItemProps) => {
  return (
    <ListItem
      onClick={onForward}
      cursor="pointer"
      width={
        listItemMode === "third"
          ? "calc(100% / 3)"
          : listItemMode === "half"
          ? "50%"
          : "100%"
      }
    >
      <HStack
        m={5}
        spacing={5}
        background={"white"}
        padding={1}
        paddingBottom={2}
        paddingTop={1.5}
        borderRadius={"lg"}
        overflow="hidden"
        boxShadow="4px 0px 24px #00000033"
      >
        <VStack alignItems="center" spacing={2} flex="1 1 auto">
          <Image
            borderTopRadius={"lg"}
            src={imageUrlBuilder.image(image.asset).url()}
            alt=""
            // Something odd happens with the background color
            // to right of the image at widths above this.
            width="98%"
          />
          <ToolkitName
            alignSelf="flex-start"
            paddingLeft={2}
            paddingRight={2}
            name={name}
            isV2Only={!!isV2Only}
          ></ToolkitName>
        </VStack>
      </HStack>
    </ListItem>
  );
};

export default IdeaTopLevelListItem;

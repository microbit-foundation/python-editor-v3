/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { VStack } from "@chakra-ui/layout";
import { Box, HStack, Image, Text } from "@chakra-ui/react";
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
  return (
    <Box onClick={onForward} cursor="pointer">
      <HStack
        spacing={5}
        background="white"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        // Fill available height to keep grid items the same size.
        height="100%"
        alignItems="flex-start"
      >
        <VStack alignItems="center" spacing={2} flex="1 1 auto">
          <Image
            borderTopRadius={"lg"}
            src={imageUrlBuilder.image(image.asset).url()}
            alt=""
          />
          <ToolkitName
            alignSelf="flex-start"
            px={2.5}
            pb={2}
            name={name}
            isV2Only={!!isV2Only}
          />
        </VStack>
      </HStack>
    </Box>
  );
};

export default IdeaTopLevelListItem;

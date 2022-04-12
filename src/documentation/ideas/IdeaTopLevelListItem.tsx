/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { VStack } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
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
  const focusStyles = {
    outline: "none",
    boxShadow: "var(--chakra-shadows-outline)",
  };
  return (
    <VStack
      as="button"
      onClick={onForward}
      cursor="pointer"
      background="white"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      // Fill available height to keep grid items the same size.
      height="100%"
      spacing={2}
      _focusVisible={focusStyles}
      _focus={focusStyles}
    >
      <Image
        borderTopRadius="lg"
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
  );
};

export default IdeaTopLevelListItem;

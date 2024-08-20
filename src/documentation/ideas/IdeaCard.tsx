/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { VStack } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import { SimpleImage } from "../../common/sanity";
import DocumentationHeading from "../common/DocumentationHeading";
import OfflineImageFallback from "../OfflineImageFallback";

interface IdeaCardProps {
  name: string;
  image: SimpleImage;
  isV2Only?: boolean;
  onClick: () => void;
}

const IdeaCard = ({ name, image, isV2Only, onClick }: IdeaCardProps) => {
  const focusStyles = {
    outline: "none",
    boxShadow: "var(--chakra-shadows-outline)",
  };
  const imageProps = {
    borderTopRadius: "lg",
    width: 500,
  };
  return (
    <VStack
      as="button"
      onClick={onClick}
      cursor="pointer"
      background="white"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      spacing={2}
      _focusVisible={focusStyles}
      _focus={focusStyles}
    >
      <Image
        src={imageUrlBuilder.image(image.asset).width(550).url()}
        ignoreFallback={navigator.onLine}
        fallback={<OfflineImageFallback useIcon {...imageProps} />}
        alt=""
        {...imageProps}
      />
      <DocumentationHeading
        alignSelf="flex-start"
        textAlign="left"
        px={2.5}
        pb={2}
        name={name}
        isV2Only={!!isV2Only}
      />
    </VStack>
  );
};

export default IdeaCard;

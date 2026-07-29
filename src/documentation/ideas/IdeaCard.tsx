/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { styled } from "styled-system/jsx";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import { SimpleImage } from "../../common/sanity";
import DocumentationHeading from "../common/DocumentationHeading";
import ImageWithFallback from "../common/ImageWithFallback";
import OfflineImageFallback from "../OfflineImageFallback";

interface IdeaCardProps {
  name: string;
  image: SimpleImage;
  isV2Only?: boolean;
  onClick: () => void;
}

const IdeaCard = ({ name, image, isV2Only, onClick }: IdeaCardProps) => {
  return (
    <styled.button
      onClick={onClick}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="2"
      cursor="pointer"
      background="white"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      _focusVisible={{
        outline: "none",
        focusShadow: "outline",
      }}
      _focus={{
        outline: "none",
        focusShadow: "outline",
      }}
    >
      <ImageWithFallback
        src={imageUrlBuilder.image(image.asset).width(550).url()}
        ignoreFallback={navigator.onLine}
        fallback={<OfflineImageFallback useIcon width={500} />}
        alt=""
        borderTopRadius="lg"
        width="500px"
      />
      <DocumentationHeading
        alignSelf="flex-start"
        textAlign="left"
        px="2.5"
        pb="2"
        name={name}
        isV2Only={!!isV2Only}
      />
    </styled.button>
  );
};

export default IdeaCard;

/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  AspectRatio,
  Box,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  VStack,
} from "@microbit/ui";
import { ReactNode } from "react";

interface ResourceCardProps {
  aspectRatio?: number;
  /** Spacing scale units around the image, for artwork without a margin. */
  imagePadding?: number;
  url: string;
  imgSrc: string;
  title: ReactNode;
}

/**
 * A card linking out to a resource on another site.
 */
const ResourceCard = ({
  aspectRatio = 4 / 3,
  imagePadding,
  imgSrc,
  url,
  title,
}: ResourceCardProps) => (
  <LinkBox
    display="flex"
    flexDir="column"
    bg="white"
    borderRadius="10px"
    overflow="hidden"
    w={64}
    boxShadow="md"
    alignSelf="stretch"
  >
    <AspectRatio w="100%" ratio={aspectRatio} position="relative">
      <Box>
        <Image
          src={imgSrc}
          alt=""
          h="100%"
          w="100%"
          // Dynamic, so not extractable as a style prop.
          style={
            imagePadding ? { padding: `${imagePadding * 0.25}rem` } : undefined
          }
        />
      </Box>
    </AspectRatio>
    <VStack p={3} py={2} pb={3} flexGrow={1} gap={3} alignItems="stretch">
      <Heading as="h3" fontSize="lg" fontWeight="bold" m={3}>
        <LinkOverlay href={url} _focusVisible={{ focusRing: "outline" }}>
          {title}
        </LinkOverlay>
      </Heading>
    </VStack>
  </LinkBox>
);

export default ResourceCard;

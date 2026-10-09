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
  LinkOverlayButton,
  VStack,
} from "@microbit/ui";
import { ReactNode } from "react";

type ResourceCardProps = {
  /** A 2:1 image area instead of 4:3. */
  wide?: boolean;
  /** Spacing scale units around the image, for artwork without a margin. */
  imagePadding?: number;
  /** `cover` crops photos to the card; `contain` keeps artwork whole. */
  imageFit?: "cover" | "contain";
  imgSrc: string;
  title: ReactNode;
} & (
  | { /** A page on another site. */ url: string; onClick?: undefined }
  | { /** An action within the app. */ onClick: () => void; url?: undefined }
);

/**
 * A card linking to a resource on another site, or doing something in the app.
 */
const ResourceCard = ({
  wide,
  imagePadding,
  imageFit = "cover",
  imgSrc,
  url,
  onClick,
  title,
}: ResourceCardProps) => (
  <LinkBox
    display="flex"
    flexDir="column"
    bg="white"
    borderRadius="10px"
    overflow="hidden"
    // The carousel sizes its slides; a token width would shrink under the
    // dense preset and open up the gaps.
    w="100%"
    boxShadow="md"
    alignSelf="stretch"
  >
    <AspectRatio
      w="100%"
      // Literals so Panda can extract both.
      ratio={wide ? 2 : 4 / 3}
      position="relative"
    >
      <Box>
        <Image
          src={imgSrc}
          alt=""
          h="100%"
          w="100%"
          // Literals so Panda can extract both.
          objectFit={imageFit === "contain" ? "contain" : "cover"}
          // Dynamic, so not extractable as a style prop.
          style={
            imagePadding ? { padding: `${imagePadding * 0.25}rem` } : undefined
          }
        />
      </Box>
    </AspectRatio>
    <VStack p={3} py={2} pb={3} flexGrow={1} gap={3} alignItems="stretch">
      <Heading as="h3" fontSize="lg" fontWeight="bold" m={3}>
        {onClick ? (
          <LinkOverlayButton
            onClick={onClick}
            css={{
              fontSize: "inherit",
              fontWeight: "inherit",
              textAlign: "start",
              whiteSpace: "normal",
            }}
          >
            {title}
          </LinkOverlayButton>
        ) : (
          <LinkOverlay href={url} _focusVisible={{ focusRing: "outline" }}>
            {title}
          </LinkOverlay>
        )}
      </Heading>
    </VStack>
  </LinkBox>
);

export default ResourceCard;

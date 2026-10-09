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
import { useHref, useLinkClickHandler } from "react-router";

type ResourceCardProps = {
  aspectRatio?: number;
  /** Spacing scale units around the image, for artwork without a margin. */
  imagePadding?: number;
  /** `cover` crops photos to the card; `contain` keeps artwork whole. */
  imageFit?: "cover" | "contain";
  imgSrc: string;
  title: ReactNode;
} & (
  | { /** A page on another site. */ url: string; to?: undefined }
  | { /** A path within the app; see urls.ts. */ to: string; url?: undefined }
);

/**
 * A card linking to a resource on another site or within the app.
 */
const ResourceCard = ({
  aspectRatio = 4 / 3,
  imagePadding,
  imageFit = "cover",
  imgSrc,
  url,
  to,
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
    <AspectRatio w="100%" ratio={aspectRatio} position="relative">
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
        {to !== undefined ? (
          <RouterLinkOverlay to={to}>{title}</RouterLinkOverlay>
        ) : (
          <LinkOverlay href={url} _focusVisible={{ focusRing: "outline" }}>
            {title}
          </LinkOverlay>
        )}
      </Heading>
    </VStack>
  </LinkBox>
);

/** LinkOverlay through react-router, so the href respects the basename. */
const RouterLinkOverlay = ({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) => {
  const href = useHref(to);
  const handleClick = useLinkClickHandler(to);
  return (
    <LinkOverlay
      href={href}
      onClick={handleClick}
      _focusVisible={{ focusRing: "outline" }}
    >
      {children}
    </LinkOverlay>
  );
};

export default ResourceCard;

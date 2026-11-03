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
  Text,
  VStack,
} from "@microbit/ui";
import { ReactNode } from "react";
import LevelIndicator, { Level } from "./LevelIndicator";

type ResourceCardProps = {
  /** A 2:1 image area instead of 4:3. */
  wide?: boolean;
  /** Spacing scale units around the image, for artwork without a margin. */
  imagePadding?: number;
  /** `cover` crops photos to the card; `contain` keeps artwork whole. */
  imageFit?: "cover" | "contain";
  imgSrc: string;
  title: ReactNode;
  /**
   * A small label above the title saying what kind of resource it is, e.g.
   * "Unit of work".
   */
  resourceType?: ReactNode;
  /** A line under the title saying what the resource is. */
  description?: ReactNode;
  level?: Level;
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
  resourceType,
  description,
  level,
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
      <VStack m={3} gap={2} flexGrow={1} alignItems="stretch">
        {resourceType !== undefined && (
          <Text fontSize="xs" lineHeight="1.27" letterSpacing="0.2px" mb={1}>
            {resourceType}
          </Text>
        )}
        <Heading as="h3" fontSize="lg" fontWeight="bold">
          {onClick ? (
            <LinkOverlayButton
              onClick={onClick}
              // Undo the button recipe's size, so it matches the link.
              css={{
                h: "auto",
                minW: "0",
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
        {(description !== undefined || level) && (
          // As microbit.org's CardContent: the body sits at the bottom with
          // a fixed-height description, so the spare space in a stretched
          // card goes under the title and descriptions line up across a row.
          <VStack
            flexGrow={1}
            justifyContent="flex-end"
            alignItems="stretch"
            gap={2}
          >
            {description !== undefined && (
              <Text lineClamp={2} h="2lh">
                {description}
              </Text>
            )}
            {level && (
              <Text fontSize="xs" color="gray.600">
                <LevelIndicator value={level} />
              </Text>
            )}
          </VStack>
        )}
      </VStack>
    </VStack>
  </LinkBox>
);

export default ResourceCard;

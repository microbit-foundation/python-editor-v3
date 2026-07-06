/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  AspectRatio,
  Box,
  Heading,
  HStack,
  Image,
  Link,
  LinkBox,
  LinkOverlay,
  VStack,
} from "@chakra-ui/react";
import { ReactNode } from "react";

interface ResourceCardProps {
  aspectRatio?: number;
  imagePadding?: number;
  url: string;
  imgSrc: string;
  title: ReactNode;
}

const ResourceCard = ({
  aspectRatio = 4 / 3,
  imagePadding,
  imgSrc,
  url,
  title,
}: ResourceCardProps) => {
  return (
    <LinkBox
      display="flex"
      flexDir="column"
      bgColor="white"
      borderRadius="10px"
      overflow="hidden"
      w={64}
      boxShadow="md"
      alignSelf="stretch"
    >
      <AspectRatio w="100%" ratio={aspectRatio} position="relative">
        <Box>
          <Image src={imgSrc} alt="" p={imagePadding} h="100%" w="100%" />
        </Box>
      </AspectRatio>
      <VStack p={3} py={2} pb={3} flexGrow={1} spacing={3} alignItems="stretch">
        <HStack justifyContent="space-between" alignItems="flex-start">
          <Heading as="h3" fontSize="lg" fontWeight="bold" m={3}>
            <LinkOverlay
              href={url}
              as={Link}
              isExternal
              _focusVisible={{ boxShadow: "outline", outline: "none" }}
            >
              {title}
            </LinkOverlay>
          </Heading>
        </HStack>
      </VStack>
    </LinkBox>
  );
};

export default ResourceCard;

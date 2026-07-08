/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import { useSettings } from "../settings/settings";
import { learnMoreUrl } from "./external-links";
import bannerBackground from "theme-package/images/banner-background.svg";

// For landscape mobile screen sizes.
const shortScreenHeightBreakpoint = "@media (max-height: 700px)";

const HomepageBanner = () => {
  const [settings] = useSettings();
  return (
    <HStack w="100%">
      <HStack
        w="100%"
        mx={{ base: 3, md: 5 }}
        mt={5}
        rounded={5}
        justifyContent="center"
        backgroundColor="brand.500"
        backgroundImage={bannerBackground}
        backgroundSize="cover"
        backgroundPosition="center"
        height={{ base: 200, sm: 230, "2xl": 300 }}
        sx={{
          [shortScreenHeightBreakpoint]: {
            height: 150,
            backgroundSize: "auto 140%",
          },
        }}
      >
        <VStack
          pt={5}
          pb={5}
          textColor="white"
          textAlign="center"
          gap={{ base: 3, md: 4, "2xl": 5 }}
          sx={{ [shortScreenHeightBreakpoint]: { gap: 3 } }}
        >
          <VStack gap={{ base: 1, md: 2 }}>
            <Heading
              sx={{ [shortScreenHeightBreakpoint]: { fontSize: "2xl" } }}
              fontSize={{ base: "2xl", sm: "3xl" }}
            >
              <FormattedMessage id="homepage-banner-heading" />
            </Heading>
            <Text
              sx={{ [shortScreenHeightBreakpoint]: { fontSize: "md" } }}
              fontSize={{ base: "md", sm: "lg" }}
              pr={5}
              pl={5}
            >
              <FormattedMessage id="homepage-banner-subtitle" />
            </Text>
          </VStack>
          <Button
            as={Link}
            href={learnMoreUrl(settings.languageId)}
            backgroundColor="white"
            border={0}
            textColor="brand.700"
            _hover={{ textDecoration: "none" }}
            _focusVisible={{
              boxShadow:
                "0 0 0 2px var(--chakra-colors-brand-600), 0 0 0 6px rgba(255, 255, 255, 0.8)",
              outline: "none",
            }}
          >
            <FormattedMessage id="learn-more-action" />
          </Button>
        </VStack>
      </HStack>
    </HStack>
  );
};

export default HomepageBanner;

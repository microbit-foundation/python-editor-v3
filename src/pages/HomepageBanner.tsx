/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  darkSurface,
  Heading,
  HStack,
  LinkButton,
  Text,
  VStack,
} from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import bannerBackground from "theme-package/images/banner-background.svg";
import { microbitOrgCodeUrl } from "../external-links";
import { useSettings } from "../settings/settings";

// Landscape phones.
const shortHeight = "@media (max-height: 700px)";

const HomepageBanner = () => {
  const [{ languageId }] = useSettings();
  return (
    <HStack w="100%">
      <HStack
        {...darkSurface}
        w="100%"
        mx={{ base: 3, md: 5 }}
        mt={5}
        borderRadius="5px"
        justifyContent="center"
        bg="brand.500"
        backgroundSize="cover"
        backgroundPosition="center"
        height={{ base: "200px", sm: "230px", "2xl": "300px" }}
        css={{
          [shortHeight]: { height: "150px", backgroundSize: "auto 140%" },
        }}
        style={{ backgroundImage: `url(${bannerBackground})` }}
      >
        <VStack
          py={5}
          color="white"
          textAlign="center"
          gap={{ base: 3, md: 4, "2xl": 5 }}
          css={{ [shortHeight]: { gap: 3 } }}
        >
          <VStack gap={{ base: 1, md: 2 }}>
            <Heading
              fontSize={{ base: "2xl", sm: "3xl" }}
              css={{ [shortHeight]: { fontSize: "2xl" } }}
            >
              <FormattedMessage id="homepage-banner-heading" />
            </Heading>
            <Text
              fontSize={{ base: "md", sm: "lg" }}
              px={5}
              css={{ [shortHeight]: { fontSize: "md" } }}
            >
              <FormattedMessage id="homepage-banner-subtitle" />
            </Text>
          </VStack>
          <LinkButton
            href={microbitOrgCodeUrl(languageId)}
            css={{
              bg: "white",
              border: 0,
              color: "brand.700",
              _hover: { bg: "white", color: "brand.700" },
            }}
          >
            <FormattedMessage id="learn-more-action" />
          </LinkButton>
        </VStack>
      </HStack>
    </HStack>
  );
};

export default HomepageBanner;

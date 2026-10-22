/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button, HStack, Link, Text } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import { styled } from "styled-system/jsx";
import { useDeployment } from "../deployment";

const fontSize = { base: "sm", sm: "md" };

/**
 * Copyright and legal links, as ml-trainer's footer without its app store
 * badges.
 */
const HomepageFooter = () => {
  const { copyrightHolder, privacyPolicyLink, termsOfUseLink, compliance } =
    useDeployment();
  return (
    <styled.footer
      display="flex"
      flexDirection="column"
      alignItems="center"
      px={5}
      py={5}
      mt={8}
      gap={5}
      bg="#e5e5e5"
    >
      <HStack
        flexWrap="wrap"
        justifyContent="center"
        columnGap={5}
        rowGap={1}
        fontSize={fontSize}
      >
        {copyrightHolder && (
          <Text
            fontSize={fontSize}
            flexBasis={{ base: "100%", sm: "auto" }}
            textAlign="center"
          >
            © {copyrightHolder}
          </Text>
        )}
        {compliance.manageCookies && (
          <Button
            variant="link"
            css={{ color: "inherit", fontSize }}
            onPress={compliance.manageCookies}
          >
            <FormattedMessage id="cookies-action" />
          </Button>
        )}
        {privacyPolicyLink && (
          <Link
            variant="standalone"
            href={privacyPolicyLink}
            rel="noopener noreferrer"
          >
            <FormattedMessage id="privacy-policy" />
          </Link>
        )}
        {termsOfUseLink && (
          <Link
            variant="standalone"
            href={termsOfUseLink}
            rel="noopener noreferrer"
          >
            <FormattedMessage id="terms-of-use" />
          </Link>
        )}
      </HStack>
    </styled.footer>
  );
};

export default HomepageFooter;

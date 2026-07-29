/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image, Text } from "@microbit/ui";
import { CSSProperties } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { VStack } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import offlinePlaceholder from "./offline.svg";

interface OfflineImageFallbackProps {
  useIcon?: boolean;
  /** Width of the image being substituted (px number or CSS size). */
  width?: number | string;
  height?: number | string;
  css?: SystemStyleObject;
  style?: CSSProperties;
}

const OfflineImageFallback = ({
  useIcon = false,
  width,
  height,
  css: cssProp,
  style,
}: OfflineImageFallbackProps) => {
  const intl = useIntl();
  return (
    <>
      {useIcon ? (
        <Image
          src={offlinePlaceholder}
          css={cssProp}
          // Caller-supplied dimensions are runtime values.
          style={{ width, height, ...style }}
          p="2"
          alt={intl.formatMessage({ id: "offline-image-alt" })}
        />
      ) : (
        <VStack
          justifyContent="center"
          css={cssProp}
          style={{ width, height, maxWidth: width, ...style }}
        >
          <Text textAlign="center" wordBreak="break-word">
            <FormattedMessage id="offline-image-alt" />
          </Text>
        </VStack>
      )}
    </>
  );
};

export default OfflineImageFallback;

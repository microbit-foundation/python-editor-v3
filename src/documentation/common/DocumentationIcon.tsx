/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image, ImageProps } from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import { SimpleImage } from "../../common/sanity";
import OfflineImageFallback from "../OfflineImageFallback";

interface DocumentationIconProps extends ImageProps {
  icon: SimpleImage;
  reduced: boolean;
}

const DocumentationIcon = ({
  icon,
  reduced,
  ...props
}: DocumentationIconProps) => {
  const size = reduced ? "50px" : "80px";
  const imageProps = {
    transition: "all .2s",
    width: size,
    height: size,
  };
  return (
    <Image
      {...props}
      src={imageUrlBuilder.image(icon.asset).url()}
      ignoreFallback={navigator.onLine}
      fallback={
        <OfflineImageFallback
          useIcon
          {...props}
          {...imageProps}
          width={size}
          height={size}
        />
      }
      alt=""
      {...imageProps}
    />
  );
};

export default DocumentationIcon;

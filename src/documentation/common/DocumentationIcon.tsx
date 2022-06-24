/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image, ImageProps } from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import { SimpleImage } from "../../common/sanity";

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
  return (
    <Image
      {...props}
      src={imageUrlBuilder.image(icon.asset).url()}
      alt=""
      transition="all .2s"
      width={size}
      height={size}
    />
  );
};

export default DocumentationIcon;

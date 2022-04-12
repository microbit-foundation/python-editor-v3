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
}

const DocumentationIcon = ({ icon, ...props }: DocumentationIconProps) => {
  return (
    <Image
      {...props}
      src={imageUrlBuilder.image(icon.asset).url()}
      alt=""
      width="80px"
      height="80px"
    />
  );
};

export default DocumentationIcon;

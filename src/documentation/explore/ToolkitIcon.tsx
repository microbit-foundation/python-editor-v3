/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image, ImageProps } from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import { ToolkitImage } from "./model";

interface ToolkitIconProps extends ImageProps {
  icon: ToolkitImage;
}

const ToolkitIcon = ({ icon, ...props }: ToolkitIconProps) => {
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

export default ToolkitIcon;

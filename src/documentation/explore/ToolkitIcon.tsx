/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Image } from "@chakra-ui/react";
import { imageUrlBuilder } from "../../common/imageUrlBuilder";
import { ToolkitImage } from "./model";

interface ToolkitIconProps {
  icon: ToolkitImage;
}

const ToolkitIcon = ({ icon }: ToolkitIconProps) => {
  console.log(icon);
  return (
    <Image
      src={imageUrlBuilder.image(icon.asset).url()}
      alt=""
      width="80px"
      borderRadius="lg"
    />
  );
};

export default ToolkitIcon;

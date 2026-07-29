/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ComponentProps } from "react";
import { styled } from "styled-system/jsx";

// App-side tag (decision: no library Tag while this is the only consumer).
// Chakra Tag md base (inline-flex, centred, fontSize md, lineHeight 1.2)
// plus this file's overrides.
const TagSpan = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: "md",
    lineHeight: 1.2,
    fontWeight: "semibold",
    background: "brand.500",
    color: "gray.25",
    pt: "1px",
    pb: "1px",
    pl: "1.5",
    pr: "1.5",
    ml: "1.5",
    borderRadius: "4px",
  },
});

interface V2TagProps extends ComponentProps<typeof TagSpan> {}

const V2Tag = (props: V2TagProps) => {
  return <TagSpan {...props}>V2</TagSpan>;
};

export default V2Tag;

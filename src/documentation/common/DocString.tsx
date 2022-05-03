/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/layout";
import React from "react";
import { renderMarkdown } from "../../editor/codemirror/language-server/documentation";

export interface DocStringProps extends BoxProps {
  value: string;
}

const DocString = React.memo(({ value, ...props }: DocStringProps) => {
  const html = renderMarkdown(value);
  return (
    <Box
      className="docs-spacing docs-code"
      dangerouslySetInnerHTML={html}
      {...props}
    />
  );
});

export default DocString;

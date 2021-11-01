/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/layout";
import React from "react";
import { renderMarkdown } from "../editor/codemirror/language-server/documentation";

export interface DocStringProps {
  value: string;
}

const DocString = React.memo(({ value }: DocStringProps) => {
  const html = renderMarkdown(value);
  return (
    <Box
      className="docs-markdown"
      fontSize="sm"
      mt={2}
      fontWeight="normal"
      dangerouslySetInnerHTML={html}
    />
  );
});

export default DocString;

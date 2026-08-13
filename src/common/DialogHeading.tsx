/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode } from "react";
import { Heading } from "react-aria-components";
import { css } from "styled-system/css";

const dialogHeadingClass = css({
  fontSize: "xl",
  fontWeight: "semibold",
});

/**
 * Semantic heading that uses the RAC Dialog's `title` slot, for headings
 * rendered in the dialog body rather than via ModalHeader.
 */
const DialogHeading = ({ children }: { children: ReactNode }) => (
  <Heading slot="title" className={dialogHeadingClass}>
    {children}
  </Heading>
);

export default DialogHeading;

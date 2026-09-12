/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useMediaQuery } from "@microbit/ui";
import SendButton from "./SendButton";
import SaveMenuButton from "./SaveMenuButton";
import { widthXl } from "../common/media-queries";
import React, { ForwardedRef } from "react";
import { styled } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";

interface ProjectActionBarProps {
  sendButtonRef: React.RefObject<HTMLButtonElement>;
  "aria-label"?: string;
  css?: SystemStyleObject;
}

const ProjectActionBar = React.forwardRef(
  (
    { sendButtonRef, css: cssProp, ...props }: ProjectActionBarProps,
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const isWideScreen = useMediaQuery(widthXl);
    const size = "lg";
    return (
      <styled.section
        {...props}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        py="5"
        px={isWideScreen ? "10" : "5"}
        css={cssProp}
      >
        <SendButton size={size} ref={ref} sendButtonRef={sendButtonRef} />
        <SaveMenuButton size={size} />
      </styled.section>
    );
  }
);

export default ProjectActionBar;

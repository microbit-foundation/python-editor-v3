/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/react";
import { Traceback } from "../device/device-hooks";
import { MAIN_FILE } from "../fs/fs";
import TracebackLink from "./TracebackLink";

interface MaybeTracebackLinkProps {
  traceback: Traceback;
}

/**
 * Renders a link to the editor line if provided with a traceback, otherwise nothing.
 */
const MaybeTracebackLink = ({ traceback }: MaybeTracebackLinkProps) => {
  const { file, line } = traceback;
  if (file === MAIN_FILE && line) {
    return (
      <TracebackLink traceback={traceback}>
        <Text as="span" textDecoration="underline">
          line {line}
        </Text>{" "}
        {traceback.error}
      </TracebackLink>
    );
  }
  if (file && line) {
    return (
      <TracebackLink traceback={traceback}>
        <Text as="span" textDecoration="underline">
          {file} line {line}
        </Text>{" "}
        {traceback.error}
      </TracebackLink>
    );
  }
  return null;
};

export default MaybeTracebackLink;

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Traceback } from "../device/device-hooks";
import { MAIN_FILE } from "../fs/fs";
import TracebackLink from "./TracebackLink";

interface MaybeTracebackLinkProps {
  traceback: Traceback;
}

const MaybeTracebackLink = ({ traceback }: MaybeTracebackLinkProps) => {
  const { file, line } = traceback;
  if (file === MAIN_FILE && line) {
    return <TracebackLink traceback={traceback}>line {line}</TracebackLink>;
  }
  if (file && line) {
    return (
      <TracebackLink traceback={traceback}>
        {file} line {line}
      </TracebackLink>
    );
  }
  return null;
};

export default MaybeTracebackLink;

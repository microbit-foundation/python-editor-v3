/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { Traceback } from "../device/device-hooks";
import { useSelection } from "../workbench/use-selection";

interface TracebackLinkProps {
  traceback: Traceback;
  children: ReactNode;
}

/**
 * A link from a traceback to open the editor at the file and line.
 */
const TracebackLink = ({ traceback, children }: TracebackLinkProps) => {
  const [, setSelection] = useSelection();
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      const { file, line } = traceback;
      if (file) {
        setSelection({
          file,
          location: { line },
        });
      }
    },
    [setSelection, traceback]
  );
  return (
    <Link data-testid="traceback-link" onClick={handleClick}>
      {children}
    </Link>
  );
};

export default TracebackLink;

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Link } from "@microbit/ui";
import { ComponentProps } from "react";

type MaybeLinkProps = ComponentProps<typeof Link>;

/**
 * A link but renders the children directly if there's no href passed.
 */
const MaybeLink = ({ href, children, ...props }: MaybeLinkProps) => {
  return typeof href === "string" ? (
    <Link {...props} href={href}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
};

export default MaybeLink;

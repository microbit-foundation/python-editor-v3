import { Link, LinkProps } from "@chakra-ui/layout";

/**
 * Chakra's link but renders the children directly if there's no href passed.
 */
const MaybeLink = ({ href, children, ...props }: LinkProps) => {
  return typeof href === "string" ? (
    <Link {...props} href={href}>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
};

export default MaybeLink;

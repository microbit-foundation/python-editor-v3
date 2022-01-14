import { Box, BoxProps } from "@chakra-ui/layout";
import { usePrefersReducedMotion, usePrevious } from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { Anchor } from "../../router-hooks";
import { useLogging } from "../../logging/logging-hooks";
import { useScrollablePanelAncestor } from "../../workbench/ScrollablePanel";

interface HighlightProps extends BoxProps {
  anchor?: Anchor;
  entryName: string;
  active: Boolean | undefined;
  disclosure: any;
}

const Highlight = ({
  children,
  active,
  anchor,
  entryName,
  disclosure,
  ...props
}: HighlightProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const previousAnchor = usePrevious(anchor);
  const scrollable = useScrollablePanelAncestor();
  const prefersReducedMotion = usePrefersReducedMotion();
  const logging = useLogging();
  const [highlighting, setHighlighting] = useState(false);
  useEffect(() => {
    if (previousAnchor !== anchor && active) {
      logging.log("Activating " + entryName);
      disclosure.onOpen();
      // Delay until after the opening animation so the full container height is known for the scroll.
      window.setTimeout(() => {
        if (ref.current && scrollable.current) {
          scrollable.current.scrollTo({
            // Fudge to account for the fixed header and to leave a small gap.
            top: ref.current.offsetTop - 112 - 25,
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
        setTimeout(() => {
          setHighlighting(true);
          setTimeout(() => {
            setHighlighting(false);
          }, 3000);
        }, 300);
      }, 150);
    }
  }, [
    anchor,
    scrollable,
    active,
    previousAnchor,
    prefersReducedMotion,
    logging,
    disclosure,
    entryName,
  ]);

  const handleHighlightClick = useCallback(() => {
    setHighlighting(false);
  }, [setHighlighting]);

  const style = highlighting
    ? {
        backgroundColor: "brand.100",
        transition: "background-color ease-out 0.2s",
      }
    : { transition: "background-color ease-in 0.6s" };
  return (
    <Box
      onClick={handleHighlightClick}
      borderLeftRadius="md"
      ref={ref}
      {...props}
      {...style}
    >
      {children}
    </Box>
  );
};

export default Highlight;

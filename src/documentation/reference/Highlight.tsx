/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useMediaQuery, usePrevious } from "@microbit/ui";
import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { Box } from "styled-system/jsx";
import { Anchor } from "../../router-hooks";
import { useLogging } from "../../logging/logging-hooks";
import { useScrollablePanelAncestor } from "../../common/ScrollablePanel";

/**
 * The subset of Chakra's useDisclosure return value we use, implemented
 * with useState by callers.
 */
export interface HighlightDisclosure {
  isOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
}

interface HighlightProps {
  children: ReactNode;
  anchor?: Anchor;
  id: string;
  active: boolean | undefined;
  disclosure: HighlightDisclosure;
}

const Highlight = ({
  children,
  active,
  anchor,
  id,
  disclosure,
}: HighlightProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const previousAnchor = usePrevious(anchor);
  const scrollable = useScrollablePanelAncestor();
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)"
  );
  const logging = useLogging();
  const [highlighting, setHighlighting] = useState(false);
  useEffect(() => {
    if (previousAnchor !== anchor && active) {
      logging.log("Activating " + id);
      disclosure.onOpen();
      // Delay until after the opening animation so the full container height is known for the scroll.
      window.setTimeout(() => {
        if (ref.current && scrollable.current) {
          const stickyHeaderHeight = scrollable.current
            .querySelector("header")!
            .getBoundingClientRect().height;
          const gap = 25;
          scrollable.current.scrollTo({
            top: ref.current.offsetTop - stickyHeaderHeight - gap,
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
    active,
    anchor,
    disclosure,
    id,
    logging,
    prefersReducedMotion,
    previousAnchor,
    scrollable,
  ]);

  const handleHighlightClick = useCallback(() => {
    setHighlighting(false);
  }, [setHighlighting]);

  return (
    <Box
      onClick={handleHighlightClick}
      borderLeftRadius="md"
      ref={ref}
      backgroundColor={highlighting ? "brand.100" : undefined}
      transition={
        highlighting
          ? "background-color ease-out 0.2s"
          : "background-color ease-in 0.6s"
      }
    >
      {children}
    </Box>
  );
};

export default Highlight;

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { motion, Spring, useReducedMotion } from "framer-motion";

const transition: Spring = {
  type: "spring",
  bounce: 0.2,
  duration: 0.5,
};

const animations = {
  back: {
    initial: {
      x: "-100%",
    },
    animate: {
      x: 0,
      transition,
      // Workaround. Avoid non-none transform remaining in the DOM which affects stacking contexts
      // https://github.com/framer/motion/issues/823
      transitionEnd: {
        x: 0,
      },
    },
  },
  forward: {
    initial: {
      x: "100%",
    },
    animate: {
      x: 0,
      transition,
      // See workaround note above.
      transitionEnd: {
        x: 0,
      },
    },
  },
  none: {
    initial: {
      x: 0,
    },
    animate: {
      x: 0,
    },
  },
};

const Slide = ({
  direction,
  children,
}: {
  direction: "forward" | "back" | "none";
  children: JSX.Element;
}) => {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? (
    children
  ) : (
    <motion.div
      initial={animations[direction].initial}
      animate={animations[direction].animate}
    >
      {children}
    </motion.div>
  );
};

export default Slide;

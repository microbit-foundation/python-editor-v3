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
    },
  },
  forward: {
    initial: {
      x: "100%",
    },
    animate: {
      x: 0,
      transition,
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

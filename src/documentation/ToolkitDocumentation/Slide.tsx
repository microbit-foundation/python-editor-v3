/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { motion, Spring, useReducedMotion } from "framer-motion";

const animations = {
  forward: {
    initial: {
      x: "-100%",
    },
    animate: {
      x: 0,
    },
  },
  back: {
    initial: {
      x: "100%",
    },
    animate: {
      x: 0,
    },
  },
  none: {
    initial: false,
    animate: {},
  },
};
const spring: Spring = {
  type: "spring",
  bounce: 0.2,
  duration: 0.5,
};

const Slide = ({
  direction,
  children,
}: {
  direction: "forward" | "back" | "none";
  children: JSX.Element;
}) => {
  const animation = animations[direction];
  const reducedMotion = useReducedMotion();
  return reducedMotion ? (
    children
  ) : (
    <motion.div
      transition={spring}
      initial={animation.initial}
      animate={animation.animate}
    >
      {children}
    </motion.div>
  );
};

export default Slide;

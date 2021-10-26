/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { usePrevious } from "@chakra-ui/hooks";
import { motion, Spring } from "framer-motion";
import { ReactNode, useState } from "react";
import { Toolkit, ToolkitNavigationState } from "./model";
import ToolkitLevelItem from "./ToolkitLevelItem";
import ToolkitLevelTopic from "./ToolkitLevelTopic";
import ToolkitLevelTopicList from "./ToolkitLevelTopicList";

interface ToolkitProps {
  toolkit: Toolkit;
}

export const ToolkitDocumentation = ({ toolkit }: ToolkitProps) => {
  const [state, setState] = useState<ToolkitNavigationState>({});
  const previous = usePrevious(state);
  const currentLevel = [state.itemId, state.topicId].filter(Boolean).length;
  const previousLevel = previous
    ? [previous.itemId, previous.topicId].filter(Boolean).length
    : 0;
  const direction =
    currentLevel === previousLevel
      ? "none"
      : currentLevel > previousLevel
      ? "forward"
      : "back";
  return (
    <ActiveTooklitLevel
      key={state.topicId + "-" + state.itemId}
      state={state}
      setState={setState}
      toolkit={toolkit}
      direction={direction}
    />
  );
};

interface ActiveTooklitLevelProps extends ToolkitProps {
  state: ToolkitNavigationState;
  setState: React.Dispatch<React.SetStateAction<ToolkitNavigationState>>;
  direction: "forward" | "back" | "none";
}

const ActiveTooklitLevel = ({
  state,
  setState,
  toolkit,
  direction,
}: ActiveTooklitLevelProps) => {
  if (state.topicId && state.itemId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      const item = topic.contents.find((i) => i.name === state.itemId);
      if (item) {
        return (
          <Slide direction={direction}>
            <ToolkitLevelItem
              toolkit={toolkit}
              topic={topic}
              item={item}
              onNavigate={setState}
            />
          </Slide>
        );
      }
    }
  } else if (state.topicId) {
    const topic = toolkit.contents.find((t) => t.name === state.topicId);
    if (topic) {
      return (
        <Slide direction={direction}>
          <ToolkitLevelTopic
            toolkit={toolkit}
            topic={topic}
            onNavigate={setState}
          />
        </Slide>
      );
    }
  }
  return (
    <Slide direction={direction}>
      <ToolkitLevelTopicList toolkit={toolkit} onNavigate={setState} />
    </Slide>
  );
};

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
  children: ReactNode;
}) => {
  const animation = animations[direction];
  return (
    <motion.div
      transition={spring}
      initial={animation.initial}
      animate={animation.animate}
    >
      {children}
    </motion.div>
  );
};

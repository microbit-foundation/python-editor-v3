/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RiRobot2Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonComposableProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

interface ElizaExampleButtonProps extends CollapsibleButtonComposableProps {}

/**
 * Adds the microchat module and an ELIZA-style chatbot to the project.
 */
const ElizaExampleButton = (props: ElizaExampleButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <CollapsibleButton
      {...props}
      text={intl.formatMessage({ id: "create-eliza-example" })}
      onClick={actions.createElizaExample}
      icon={<RiRobot2Line />}
    />
  );
};

export default ElizaExampleButton;

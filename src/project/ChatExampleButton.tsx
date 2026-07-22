/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RiChat1Line } from "react-icons/ri";
import { useIntl } from "react-intl";
import CollapsibleButton, {
  CollapsibleButtonComposableProps,
} from "../common/CollapsibleButton";
import { useProjectActions } from "./project-hooks";

interface ChatExampleButtonProps extends CollapsibleButtonComposableProps {}

/**
 * Adds the microchat module and a starter chat program to the project.
 */
const ChatExampleButton = (props: ChatExampleButtonProps) => {
  const actions = useProjectActions();
  const intl = useIntl();
  return (
    <CollapsibleButton
      {...props}
      text={intl.formatMessage({ id: "create-chat-example" })}
      onClick={actions.createChatExample}
      icon={<RiChat1Line />}
    />
  );
};

export default ChatExampleButton;

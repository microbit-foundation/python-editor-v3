/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@microbit/ui";
import { FormattedMessage } from "react-intl";
import { Stack } from "styled-system/jsx";
import AreaHeading from "../common/AreaHeading";
import { docStylesClass } from "../common/documentation-styles";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import Spinner from "../common/Spinner";
import { useOpenIdeaSlug } from "../project/projects-hooks";
import { useDocumentation } from "./documentation-hooks";
import IdeaGuideContent from "./ideas/IdeaGuideContent";
import { Idea } from "./ideas/model";

/**
 * The guide for the idea the open project came from: its content without
 * the program, which is in the editor.
 */
const GuideArea = () => {
  const slug = useOpenIdeaSlug();
  const { ideas } = useDocumentation();
  if (ideas.status === "loading") {
    return <Spinner />;
  }
  const idea =
    ideas.status === "ok"
      ? ideas.content.find((idea) => idea.slug.current === slug)
      : undefined;
  if (!idea) {
    return (
      <Text p="5" height="100%">
        <FormattedMessage id="toolkit-error-loading" />
      </Text>
    );
  }
  return <Guide idea={idea} />;
};

const Guide = ({ idea }: { idea: Idea }) => (
  <HeadedScrollablePanel heading={<AreaHeading name={idea.name} />}>
    <Stack
      gap="3"
      fontSize="sm"
      p="5"
      pr="3"
      mt="1"
      mb="1"
      className={docStylesClass}
    >
      <IdeaGuideContent idea={idea} />
    </Stack>
  </HeadedScrollablePanel>
);

export default GuideArea;

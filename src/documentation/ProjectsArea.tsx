/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/layout";
import { useIntl } from "react-intl";
import HeadedScrollablePanel from "../common/HeadedScrollablePanel";
import AreaHeading from "../common/AreaHeading";

const ProjectsArea = () => {
  const intl = useIntl();
  return (
    <HeadedScrollablePanel
      heading={
        <AreaHeading
          name={intl.formatMessage({ id: "projects-tab" })}
          description={intl.formatMessage({ id: "projects-tab-description" })}
        />
      }
    >
      <Box height="100%" />
    </HeadedScrollablePanel>
  );
};

export default ProjectsArea;

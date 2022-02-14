/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@chakra-ui/layout";
import { useIntl } from "react-intl";
import ToolkitLevel from "./explore/ToolkitLevel";
import ToolkitTopLevelHeading from "./explore/ToolkitTopLevelHeading";

const ProjectsArea = () => {
  const intl = useIntl();
  return (
    <ToolkitLevel
      direction="none"
      heading={
        <ToolkitTopLevelHeading
          name={intl.formatMessage({ id: "projects-tab" })}
          description={intl.formatMessage({ id: "projects-tab-description" })}
        />
      }
    >
      <Box height="100%" />
    </ToolkitLevel>
  );
};

export default ProjectsArea;

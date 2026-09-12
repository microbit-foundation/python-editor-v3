/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box } from "@microbit/ui";
import PythonLogo from "../common/PythonLogo";

interface ProjectIconProps {
  /**
   * The projects page cards carry a selection checkbox in the top-left
   * corner, so the glyph drops below it rather than sharing the corner.
   */
  hasCheckbox?: boolean;
}

/** The picture on a project card: the Python logo in the top-left corner. */
const ProjectIcon = ({ hasCheckbox = false }: ProjectIconProps) => (
  <Box
    w={16}
    h={16}
    flexShrink={0}
    color="brand.500"
    alignSelf="flex-start"
    // The checkbox's hover and selection background is a 60px strip in the
    // card's corner; the glyph starts below it.
    ml={hasCheckbox ? 0 : 3}
    mt={hasCheckbox ? 14 : 3}
  >
    <PythonLogo width="100%" height="100%" />
  </Box>
);

export default ProjectIcon;

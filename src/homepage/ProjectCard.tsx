/**
 * (c) 2024, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Card,
  CardBody,
  Icon,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import PythonLogo from "../common/PythonLogo";
import { ProjectRecord } from "../fs/db";
import { timeAgo } from "./datetime";
import ProjectCardActions from "./ProjectCardActions";
import { ProjectNameDialogReason } from "./project-name";
import { shortScreenHeightBreakpoint } from "./responsive";

interface ProjectCardProps {
  projectData: ProjectRecord;
  isSelected?: boolean;
  onSelected?: (id: string) => void;
  onSkipToToolbar?: () => void;
  onDeleteProject: (id: string) => void;
  onOpenProject: (id: string) => void;
  onRenameDuplicateProject: (
    reason: ProjectNameDialogReason,
    id: string
  ) => void;
}

const ProjectCard = ({
  projectData,
  isSelected,
  onSelected,
  onSkipToToolbar,
  onDeleteProject,
  onOpenProject,
  onRenameDuplicateProject,
}: ProjectCardProps) => {
  const intl = useIntl();
  const { id, name, files, timestamp } = projectData;
  const fileCount = Object.keys(files).length;
  const hasCheckbox = !!onSelected;

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpenProject(id);
    },
    [id, onOpenProject]
  );

  return (
    <LinkBox h="100%" w="100%" role="group">
      <Card h="100%" w="100%">
        <CardBody
          display="flex"
          sx={{ [shortScreenHeightBreakpoint]: { p: 3 } }}
        >
          <Stack h="100%" w="100%" spacing={0}>
            <ProjectCardActions
              id={id}
              name={name}
              isSelected={isSelected}
              onSelected={onSelected}
              onSkipToToolbar={onSkipToToolbar}
              onDeleteProject={onDeleteProject}
              onOpenProject={onOpenProject}
              onRenameDuplicateProject={onRenameDuplicateProject}
            />
            <Icon
              as={PythonLogo}
              width="60px"
              height="auto"
              color="brand.500"
              ml={0}
              mt={hasCheckbox ? 8 : 0}
              sx={{
                [shortScreenHeightBreakpoint]: {
                  width: "44px",
                  ml: 0,
                  mt: hasCheckbox ? 4 : 0,
                },
              }}
            />
            <LinkOverlay
              as={Button}
              mt="auto"
              h={8}
              textAlign="left"
              fontSize="xl"
              isTruncated
              href="#"
              onClick={handleOpen}
              variant="unstyled"
              _focusVisible={{ boxShadow: "outline", outline: "none" }}
            >
              {name}
            </LinkOverlay>
            <Text noOfLines={1} h="1lh">
              <FormattedMessage
                id="project-file-count"
                values={{ count: fileCount }}
              />
            </Text>
            <Text fontSize="sm" pt={2} color="blackAlpha.700">
              {timeAgo(intl, timestamp)}
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </LinkBox>
  );
};

export default ProjectCard;

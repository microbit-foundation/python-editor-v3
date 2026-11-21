/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import useActionFeedback from "../common/use-action-feedback";
import { createHomePageUrl } from "../urls";
import { useProjects } from "./projects-hooks";

/**
 * Takes the editor to the home page, saying why, when the project it has
 * open is deleted in another tab. Staying would show a project that can no
 * longer be saved.
 */
const OpenProjectDeletedRedirect = () => {
  const projects = useProjects();
  const navigate = useNavigate();
  const actionFeedback = useActionFeedback();
  const intl = useIntl();
  useEffect(() => {
    const listener = () => {
      actionFeedback.warning({
        title: intl.formatMessage({ id: "project-deleted-elsewhere-title" }),
        description: intl.formatMessage({
          id: "project-deleted-elsewhere-description",
        }),
      });
      void navigate(createHomePageUrl());
    };
    projects.addEventListener("openprojectdeleted", listener);
    return () => projects.removeEventListener("openprojectdeleted", listener);
  }, [actionFeedback, intl, navigate, projects]);
  return null;
};

export default OpenProjectDeletedRedirect;

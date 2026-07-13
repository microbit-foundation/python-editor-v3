/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  getStoredCurrentProjectId,
  useProjects,
} from "../project/projects-hooks";
import Workbench from "./Workbench";

type Status = "loading" | "ready" | "missing";

/**
 * Ensures a project is loaded into the editor before rendering the workbench.
 *
 * The "current" project id is held in session storage. If it's missing or no
 * longer exists we redirect back to the home page.
 */
const ProjectGate = () => {
  const { openProject, loadedProjectId } = useProjects();
  const openProjectRef = useRef(openProject);
  openProjectRef.current = openProject;
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    const id = getStoredCurrentProjectId();
    if (!id) {
      setStatus("missing");
      return;
    }
    openProjectRef.current(id).then((ok) => {
      if (!cancelled) {
        setStatus(ok ? "ready" : "missing");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // The open project was deleted (possibly from another tab): go home.
    if (status === "ready" && loadedProjectId === undefined) {
      setStatus("missing");
    }
  }, [status, loadedProjectId]);

  if (status === "missing") {
    return <Navigate to="/" replace />;
  }
  if (status !== "ready") {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" thickness="4px" color="brand.500" />
      </Flex>
    );
  }
  return <Workbench />;
};

export default ProjectGate;

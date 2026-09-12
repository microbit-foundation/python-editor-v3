/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { ProjectListEntry } from "../fs/projects-db";
import { Projects } from "./projects";

const ProjectsContext = createContext<Projects | undefined>(undefined);

export const ProjectsProvider = ProjectsContext.Provider;

/**
 * The projects in this browser. Throws in iframe controller mode, where the
 * embedding page owns the project; use useProjectsIfAvailable there.
 */
export const useProjects = (): Projects => {
  const projects = useContext(ProjectsContext);
  if (!projects) {
    throw new Error("Missing ProjectsProvider");
  }
  return projects;
};

/**
 * The projects in this browser, or undefined in iframe controller mode.
 */
export const useProjectsIfAvailable = (): Projects | undefined =>
  useContext(ProjectsContext);

/**
 * The project list, kept up to date as projects change in this tab or
 * another. The route loader refreshes it before the page renders.
 */
export const useProjectList = (): ProjectListEntry[] => {
  const projects = useProjects();
  const subscribe = useCallback(
    (listener: () => void) => {
      projects.addEventListener("change", listener);
      return () => projects.removeEventListener("change", listener);
    },
    [projects]
  );
  return useSyncExternalStore(subscribe, () => projects.projects);
};

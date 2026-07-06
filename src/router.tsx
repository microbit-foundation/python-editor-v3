/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createBrowserRouter } from "react-router-dom";
import HomePage from "./homepage/HomePage";
import ProjectsPage from "./homepage/ProjectsPage";
import { routerBasename } from "./urls";
import ProjectGate from "./workbench/ProjectGate";

export const router = createBrowserRouter(
  [
    { path: "/", element: <HomePage /> },
    { path: "/projects", element: <ProjectsPage /> },
    { path: "/project", element: <ProjectGate /> },
    { path: "/project/:tab", element: <ProjectGate /> },
    { path: "/project/:tab/:slug", element: <ProjectGate /> },
    { path: "*", element: <HomePage /> },
  ],
  { basename: routerBasename }
);

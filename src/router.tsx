/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { NotFoundPage } from "@microbit/ui-patterns";
import { createBrowserRouter, Navigate, useParams } from "react-router";
import { baseUrl } from "./base";
import { Projects } from "./project/projects";
import RootLayout from "./RootLayout";
import { isTabName } from "./router-hooks";
import {
  basename,
  createEditorUrl,
  editorRoutePath,
  iframeEditorRoutePath,
  legacyEditorRoutePath,
} from "./urls";
import Workbench from "./workbench/Workbench";

/**
 * The editor's pre-/project URLs: a known documentation tab redirects to
 * the same tab under /project, anything else is not found.
 */
const LegacyEditorRedirect = () => {
  const { tab, slug } = useParams<"tab" | "slug">();
  if (!isTabName(tab)) {
    return <NotFound />;
  }
  return (
    <Navigate
      to={createEditorUrl({ tab, slug: slug ? { id: slug } : undefined })}
      replace
    />
  );
};

/**
 * The editor keeps its place at the root here so a #project: link on a
 * microbit.org page still opens the program it carries.
 */
const RootRedirect = () => (
  <Navigate to={createEditorUrl() + window.location.hash} replace />
);

const NotFound = () => <NotFoundPage homeUrl={baseUrl} />;

export interface RouterOptions {
  /**
   * The projects in this browser. Undefined in iframe controller mode, where
   * the editor is the only page and stays at the root.
   */
  projects: Projects | undefined;
}

export const createRouter = ({ projects }: RouterOptions) =>
  createBrowserRouter(
    [
      {
        id: "root",
        path: "",
        element: <RootLayout />,
        children: !projects
          ? [
              { path: iframeEditorRoutePath, element: <Workbench /> },
              // Deeper paths are the editor with no tab selected, as before.
              { path: "*", element: <Workbench /> },
            ]
          : [
              { index: true, element: <RootRedirect /> },
              {
                path: editorRoutePath,
                element: <Workbench />,
                // The editor needs a project; choosing one is the only
                // asynchronous step, the MicroPython load carries on behind.
                loader: async () => {
                  await projects.openCurrent();
                  return null;
                },
              },
              {
                path: legacyEditorRoutePath,
                element: <LegacyEditorRedirect />,
              },
              { path: "*", element: <NotFound /> },
            ],
      },
    ],
    { basename }
  );

/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { NotFoundPage } from "@microbit/ui-patterns";
import { createBrowserRouter, Navigate, useParams } from "react-router";
import { baseUrl } from "./base";
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
  /** Controller mode: the editor is the only page and stays at the root. */
  iframe: boolean;
}

export const createRouter = ({ iframe }: RouterOptions) =>
  createBrowserRouter(
    [
      {
        id: "root",
        path: "",
        element: <RootLayout />,
        children: iframe
          ? [
              { path: iframeEditorRoutePath, element: <Workbench /> },
              // Deeper paths are the editor with no tab selected, as before.
              { path: "*", element: <Workbench /> },
            ]
          : [
              { index: true, element: <RootRedirect /> },
              { path: editorRoutePath, element: <Workbench /> },
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

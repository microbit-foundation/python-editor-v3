/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createBrowserRouter, Outlet } from "react-router";
import ErrorBoundary from "./common/ErrorBoundary";
import { basename, editorRoutePath } from "./urls";
import Workbench from "./workbench/Workbench";

export const createRouter = () =>
  createBrowserRouter(
    [
      {
        id: "root",
        path: "",
        // Without this an uncaught render error unmounts the whole app.
        element: (
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        ),
        children: [
          { path: editorRoutePath, element: <Workbench /> },
          // Deeper paths are the editor with no tab selected, as before.
          { path: "*", element: <Workbench /> },
        ],
      },
    ],
    { basename }
  );

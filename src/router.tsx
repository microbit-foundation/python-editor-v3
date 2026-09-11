/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createBrowserRouter } from "react-router";
import RootLayout from "./RootLayout";
import { basename, editorRoutePath } from "./urls";
import Workbench from "./workbench/Workbench";

export const createRouter = () =>
  createBrowserRouter(
    [
      {
        id: "root",
        path: "",
        element: <RootLayout />,
        children: [
          { path: editorRoutePath, element: <Workbench /> },
          // Deeper paths are the editor with no tab selected, as before.
          { path: "*", element: <Workbench /> },
        ],
      },
    ],
    { basename }
  );

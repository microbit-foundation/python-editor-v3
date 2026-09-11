/**
 * App URLs.
 *
 * Paths are relative to the router basename: react-router adds it when
 * navigating or rendering a Link. Do not use them with window.location or a
 * plain anchor.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { baseUrl } from "./base";
import type { RouterState } from "./router-hooks";

/**
 * The react-router basename: the Vite base URL without its trailing slash, so
 * that both `/v/3` and `/v/3/` are the editor.
 */
export const basename =
  baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");

/**
 * Route path for the editor. The documentation tab and its anchor are
 * optional segments so the editor stays mounted as they change.
 */
export const editorRoutePath = ":tab?/:slug?";

/**
 * Path for the editor showing the given documentation tab and anchor.
 */
export const createEditorUrl = ({ tab, slug }: RouterState = {}): string =>
  "/" + [tab, slug?.id].filter((x): x is string => !!x).join("/");

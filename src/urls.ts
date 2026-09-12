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
 * that both `/v/3` and `/v/3/` are the app.
 */
export const basename =
  baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");

export const createHomePageUrl = (): string => "/";

export const createProjectsPageUrl = (): string => "/projects";

/**
 * Route path for the editor. The documentation tab and its anchor are
 * optional segments so the editor stays mounted as they change.
 */
export const editorRoutePath = "project/:tab?/:slug?";

/**
 * Route path for the editor in iframe controller mode, where the embedding
 * page owns the URL and there are no other pages.
 */
export const iframeEditorRoutePath = ":tab?/:slug?";

/**
 * Route path matching the editor's URLs from before it moved under /project,
 * so documentation links keep working.
 */
export const legacyEditorRoutePath = ":tab/:slug?";

const editorSegments = ({ tab, slug }: RouterState = {}): string =>
  [tab, slug?.id].filter((x): x is string => !!x).join("/");

/**
 * Path for the editor showing the given documentation tab and anchor.
 */
export const createEditorUrl = (state: RouterState = {}): string => {
  const rest = editorSegments(state);
  return rest ? `/project/${rest}` : "/project";
};

/**
 * Path for the editor in iframe controller mode; see iframeEditorRoutePath.
 */
export const createIframeEditorUrl = (state: RouterState = {}): string =>
  "/" + editorSegments(state);

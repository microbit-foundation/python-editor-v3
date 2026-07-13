/**
 * Internal app routes (relative to the router basename).
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { baseUrl } from "./base";

/** react-router basename derived from the Vite base URL. */
export const routerBasename =
  baseUrl === "/" ? undefined : baseUrl.replace(/\/$/, "");

export const createHomePageUrl = () => "/";
export const createEditorUrl = () => "/project";
export const createProjectsPageUrl = () => "/projects";

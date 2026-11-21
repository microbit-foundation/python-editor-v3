/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createContext, use } from "react";
import { TabName } from "../router-hooks";

/**
 * Shows a sidebar tab's panel and focuses it, before returning.
 */
export type ShowSidebarPanel = (tab: TabName) => void;

export const ShowSidebarPanelContext = createContext<ShowSidebarPanel>(
  () => {}
);

/**
 * Shows and focuses a sidebar panel at once, unlike a router change, which
 * waits on the editor route's loader.
 */
export const useShowSidebarPanel = (): ShowSidebarPanel =>
  use(ShowSidebarPanelContext);

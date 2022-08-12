/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { flags } from "../flags";

export const widthToHideSidebar = flags.simulator ? 1376 : 1110;
export const sidebarToWidthRatio = flags.simulator ? 0.27 : 0.35;
export const hideSidebarMediaQuery = `(max-width: ${widthToHideSidebar - 1}px)`;

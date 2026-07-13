/**
 * External (theme-scoped) URLs used by the home page.
 *
 * For this prototype these live here rather than in the deployment/theme
 * package. Several are placeholders carried over from CreateAI and can be
 * updated to Python-specific destinations later.
 *
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { stage } from "../environment";

const microbitOrgBaseUrl =
  stage === "PRODUCTION"
    ? "https://microbit.org/"
    : "https://stage.microbit.org/";

const langPath = (languageId: string) =>
  languageId === "en" ? "" : `${languageId.toLowerCase()}/`;

export const projectUrl = (slug: string, language: string) =>
  `${microbitOrgBaseUrl}${langPath(
    language
  )}projects/make-it-code-it/${encodeURIComponent(slug)}/`;

export const lessonUrl = (slug: string) =>
  `${microbitOrgBaseUrl}teach/lessons/${encodeURIComponent(slug)}/`;

export const userGuideUrl = () =>
  `${microbitOrgBaseUrl}get-started/user-guide/python-editor/`;

export const supportSiteFolderUrl = () =>
  "https://support.microbit.org/support/solutions/folders/19000170475";

export const accessibilityUrl = () => `${microbitOrgBaseUrl}accessibility/`;

export const learnMoreUrl = (languageId: string) =>
  `${microbitOrgBaseUrl}${langPath(languageId)}code/`;

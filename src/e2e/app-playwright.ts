/**
 * (c) 2021 - 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Page, expect } from "@playwright/test";
import { Flag } from "../flags";

export enum LoadDialogType {
  CONFIRM,
  REPLACE,
  CONFIRM_BUT_LOAD_AS_MODULE,
  NONE,
}

export interface BrowserDownload {
  filename: string;
  data: Buffer;
}

const defaultWaitForOptions = { timeout: 10_000 };

const baseUrl = "http://localhost:3000";
const reportsPath = "reports/e2e/";

interface UrlOptions {
  /**
   * Flags.
   *
   * "none" and "noWelcome" are always added.
   *
   * Do not use "*", instead explicitly enable the set of flags your test requires.
   */
  flags?: Flag[];
  /**
   * URL fragment including the #.
   */
  fragment?: string;
  /**
   * Language parameter passed via URL.
   */
  language?: string;
}

export class App {
  constructor(public readonly page: Page) {}

  async goto(options: UrlOptions = {}) {
    this.page.goto(this.optionsToURL(options));
  }

  private optionsToURL(options: UrlOptions): string {
    const flags = new Set<string>([
      "none",
      "noWelcome",
      ...(options.flags ?? []),
    ]);
    const params: Array<[string, string]> = Array.from(flags).map((f) => [
      "flag",
      f,
    ]);
    if (options.language) {
      params.push(["l", options.language]);
    }
    return (
      baseUrl +
      // We didn't use BASE_URL here as CRA seems to set it to "" before running jest.
      // Maybe can be changed since the Vite upgrade.
      (process.env.E2E_BASE_URL ?? "/") +
      "?" +
      new URLSearchParams(params) +
      (options.fragment ?? "")
    );
  }

  async expectProjectName(match: string) {
    await expect(
      this.page.getByTestId("project-name").getByText(match)
    ).toBeVisible();
  }

  async switchLanguage(locale: string) {
    // All test ids so they can be language invariant.
    await this.page.getByTestId("settings").click();
    await this.page.getByTestId("language").click();
    await this.page.getByTestId(locale).click();
  }
}

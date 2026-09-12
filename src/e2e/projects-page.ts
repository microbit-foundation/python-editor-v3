/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, Locator, Page } from "@playwright/test";
import { projectsPageUrl } from "./app.js";
import { ProjectCards } from "./home-page.js";

export class ProjectsPage {
  public cards: ProjectCards;
  private heading: Locator;
  private searchInput: Locator;
  private toolbar: Locator;

  constructor(public readonly page: Page) {
    this.cards = new ProjectCards(page);
    this.heading = page.getByRole("heading", { name: "Your projects" });
    this.searchInput = page.getByRole("searchbox", { name: "Search" });
    // Two toolbars are in the DOM, for wide and narrow layouts; only one is
    // shown, so act on the visible one.
    this.toolbar = page
      .getByRole("group", { name: "Selection actions" })
      .locator("visible=true");
  }

  async goto(): Promise<void> {
    await this.page.goto(projectsPageUrl());
    await this.expectOnPage();
  }

  async expectOnPage(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.page).toHaveURL(/\/projects(\?|$)/);
  }

  async goHome(): Promise<void> {
    await this.page.getByRole("button", { name: "Home" }).click();
  }

  async expectProjectCount(count: number): Promise<void> {
    await expect(this.page.getByRole("checkbox")).toHaveCount(count);
  }

  async expectNoProjects(): Promise<void> {
    await expect(this.page.getByText("No projects to display")).toBeVisible();
  }

  async expectProjectOrder(names: string[]): Promise<void> {
    const checkboxes = this.page.getByRole("checkbox");
    await expect(checkboxes).toHaveCount(names.length);
    for (let i = 0; i < names.length; i++) {
      await expect(checkboxes.nth(i)).toHaveAccessibleName(
        `Select ${names[i]}`
      );
    }
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async clearSearch(): Promise<void> {
    await this.page.getByRole("button", { name: "Clear" }).click();
  }

  async select(name: string): Promise<void> {
    const checkbox = this.page.getByRole("checkbox", {
      name: `Select ${name}`,
      exact: true,
    });
    await checkbox.check({ force: true });
    await expect(checkbox).toBeChecked();
  }

  async expectToolbarVisible(): Promise<void> {
    await expect(this.toolbar).toBeVisible();
  }

  async expectToolbarHidden(): Promise<void> {
    await expect(
      this.page.getByRole("group", { name: "Selection actions" })
    ).toHaveCount(0);
  }

  async expectToolbarButtons(names: string[]): Promise<void> {
    const buttons = this.toolbar.getByRole("button");
    await expect(buttons).toHaveCount(names.length);
    for (const name of names) {
      await expect(this.toolbar.getByRole("button", { name })).toBeVisible();
    }
  }

  async toolbarRename(newName: string): Promise<void> {
    await this.toolbar.getByRole("button", { name: "Rename" }).click();
    await this.cards.fillNameDialog(newName, "Rename");
  }

  async toolbarDuplicate(newName: string): Promise<void> {
    await this.toolbar.getByRole("button", { name: "Duplicate" }).click();
    await this.cards.fillNameDialog(newName, "Duplicate");
  }

  async toolbarDelete(): Promise<void> {
    await this.toolbar.getByRole("button", { name: /^Delete/ }).click();
    await this.cards.confirmDelete();
  }

  async toolbarClear(): Promise<void> {
    await this.toolbar.getByRole("button", { name: "Clear" }).click();
  }

  async sortBy(field: "Name" | "Last modified"): Promise<void> {
    await this.page
      .getByRole("combobox", { name: "Sort projects" })
      .selectOption({ label: field });
  }

  async toggleSortDirection(): Promise<void> {
    await this.page.getByRole("button", { name: /order$/ }).click();
  }
}

/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, Locator, Page } from "@playwright/test";
import { homeUrl } from "./app.js";

/**
 * The modal dialog rather than a menu popover, which also has the dialog
 * role. Modals render on a section; popovers are divs.
 */
export const modalDialog = (page: Page): Locator =>
  page.getByRole("dialog").and(page.locator("section"));

/**
 * The project cards and their menus, shared by the home and projects pages.
 */
export class ProjectCards {
  constructor(public readonly page: Page) {}

  card(name: string): Locator {
    return this.page.getByRole("button", { name, exact: true });
  }

  async open(name: string): Promise<void> {
    await this.card(name).click();
  }

  async expectVisible(name: string): Promise<void> {
    await expect(this.card(name)).toBeVisible();
  }

  async expectNotVisible(name: string): Promise<void> {
    await expect(this.card(name)).toBeHidden();
  }

  async openMenu(name: string): Promise<void> {
    await this.page
      .getByRole("button", { name: `${name} actions menu`, exact: true })
      .click();
  }

  async menuOpen(name: string): Promise<void> {
    await this.openMenu(name);
    await this.page.getByRole("menuitem", { name: "Open" }).click();
  }

  async menuRename(name: string, newName: string): Promise<void> {
    await this.openMenu(name);
    await this.page.getByRole("menuitem", { name: "Rename" }).click();
    await this.fillNameDialog(newName, "Rename");
  }

  async menuDuplicate(name: string, newName: string): Promise<void> {
    await this.openMenu(name);
    await this.page.getByRole("menuitem", { name: "Duplicate" }).click();
    await this.fillNameDialog(newName, "Duplicate");
  }

  async menuDelete(name: string): Promise<void> {
    await this.openMenu(name);
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.confirmDelete();
  }

  async fillNameDialog(newName: string, confirmLabel: string): Promise<void> {
    const dialog = modalDialog(this.page);
    await expect(dialog).toBeVisible();
    const nameInput = dialog.getByRole("textbox");
    await nameInput.fill(newName);
    await dialog.getByRole("button", { name: confirmLabel }).click();
    await expect(dialog).toBeHidden();
  }

  async confirmDelete(): Promise<void> {
    const dialog = this.page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    // "Delete", or "Delete N projects" for a selection.
    await dialog.getByRole("button", { name: /^Delete/ }).click();
    await expect(dialog).toBeHidden();
  }
}

export class HomePage {
  public cards: ProjectCards;
  private projectsHeading: Locator;

  constructor(public readonly page: Page) {
    this.cards = new ProjectCards(page);
    this.projectsHeading = page.getByRole("heading", { name: "Your projects" });
  }

  async goto(): Promise<void> {
    await this.page.goto(homeUrl());
    await this.expectOnPage();
  }

  async expectOnPage(): Promise<void> {
    await expect(this.projectsHeading).toBeVisible();
    await expect(this.page).toHaveURL(/\/(\?|$)/);
  }

  /** Creates a project, accepting the default name unless one is given. */
  async newProject(name?: string): Promise<void> {
    await this.page.getByRole("button", { name: "New project" }).click();
    if (name !== undefined) {
      await this.cards.fillNameDialog(name, "Create");
    } else {
      await modalDialog(this.page)
        .getByRole("button", { name: "Create" })
        .click();
    }
  }

  async viewAllProjects(): Promise<void> {
    await this.page.getByRole("link", { name: "View all projects" }).click();
  }
}

/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createInitialProject } from "./initial-project";
import { testMigrationUrl } from "./migration.test";

describe("createInitialProject", () => {
  it("uses migration if available", () => {
    const project = createInitialProject(testMigrationUrl);
    expect(project).toEqual({
      isDefault: false,
      name: "Hearts",
      main: "from microbit import *\r\ndisplay.show(Image.HEART)",
    });
  });
  it("otherwise uses defaults", () => {
    expect(createInitialProject("").isDefault).toEqual(true);
  });
});

/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "http://localhost:3000" }
 */
import { fromByteArray } from "base64-js";
import { MAIN_FILE } from "./fs";
import { DefaultHost } from "./host";
import { PendingProjectLink } from "./project-link";
import { defaultInitialProject } from "./initial-project";
import { testProjectLink } from "./project-link-test-data";

describe("DefaultHost", () => {
  it("uses the project link if there is one", async () => {
    const project = await new DefaultHost(
      new PendingProjectLink(testProjectLink)
    ).createInitialProject();
    expect(project).toEqual({
      files: {
        [MAIN_FILE]: fromByteArray(
          new TextEncoder().encode(
            "from microbit import *\r\ndisplay.show(Image.HEART)"
          )
        ),
      },
      projectName: "Hearts",
    });
  });
  it("otherwise uses defaults", async () => {
    const project = await new DefaultHost().createInitialProject();
    expect(project).toEqual(defaultInitialProject);
  });
});

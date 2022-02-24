import { NullLogging } from "../deployment/default/logging";
import { initializeEmbeddingController } from "./embedding-controller";
import { VersionAction } from "./fs";

describe("embedding-controller", () => {
  it("works", async () => {
    const mockWrite = jest.fn();
    const fs = {
      write: mockWrite,
      addListener: jest.fn(),
    } as any;

    const mockPostMessage = jest.fn();
    const parentWindow = { postMessage: mockPostMessage } as any;

    delete (window as any).parent;
    (window as any).parent = parentWindow;
    delete (window as any).location;
    window.location = new URL("https://localhost:3000?controller=1") as any;

    initializeEmbeddingController(new NullLogging(), fs);

    const spinEventLoop = async (check: () => void) => {
      let error: any;
      for (let i = 0; i < 100; ++i) {
        try {
          check();
          return;
        } catch (e) {
          error = e;
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      throw error;
    };

    const expectSendsMessageToParent = async (expected: any) =>
      spinEventLoop(() =>
        expect(mockPostMessage.mock.calls).toContainEqual(expected)
      );

    const expectCodeWrite = async (expected: any) =>
      spinEventLoop(() =>
        expect(mockWrite.mock.calls).toContainEqual(expected)
      );

    await expectSendsMessageToParent([
      { action: "workspacesync", type: "pyeditor" },
      "*",
    ]);
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "pyeditor",
          action: "workspacesync",
          projects: ["code1"],
        },
      })
    );
    await expectSendsMessageToParent([
      { action: "workspaceloaded", type: "pyeditor" },
      "*",
    ]);
    expect(mockWrite.mock.calls).toEqual([
      ["main.py", "code1", VersionAction.INCREMENT],
    ]);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "pyeditor",
          action: "importproject",
          project: "code2",
        },
      })
    );

    // There's nothing to wait for here except the write, as there's no confirmatory message.
    await expectCodeWrite(["main.py", "code2", VersionAction.INCREMENT]);
  });
});

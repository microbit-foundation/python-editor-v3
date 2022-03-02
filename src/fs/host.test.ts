/**
 * @jest-environment ./src/testing/custom-browser-env
 */
import { VersionAction } from "./fs";
import { DefaultHost, IframeHost } from "./host";
import { SimplePythonProject } from "./initial-project";
import { testMigrationUrl } from "./migration.test";

describe("IframeHost", () => {
  const mockWrite = jest.fn();
  const mockAddListener = jest.fn();
  const fs = {
    read: () => new TextEncoder().encode("Code read!"),
    write: mockWrite,
    addListener: mockAddListener,
    getMultiFilePythonProject: () => "",
  } as any;

  const mockPostMessage = jest.fn();
  const parentWindow = { postMessage: mockPostMessage } as any;

  delete (window as any).parent;
  (window as any).parent = parentWindow;
  delete (window as any).location;
  window.location = new URL("https://localhost:3000?controller=1") as any;

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
    spinEventLoop(() => expect(mockWrite.mock.calls).toContainEqual(expected));

  it("exchanges sync messages", async () => {
    const host = new IframeHost(parentWindow, window);

    const initialProjectPromise = host.createInitialProject();

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

    const project = await initialProjectPromise;
    expect((project as SimplePythonProject).main).toEqual("code1");
    host.notifyReady(fs);

    await expectSendsMessageToParent([
      { action: "workspaceloaded", type: "pyeditor" },
      "*",
    ]);
  });

  it("supports importproject", async () => {
    const host = new IframeHost(parentWindow, window);
    host.notifyReady(fs);

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

  it("triggers code changes on first listener", async () => {
    const host = new IframeHost(parentWindow, window, 0);
    host.notifyReady(fs);

    expect(mockAddListener.mock.calls.length).toEqual(2);
    mockAddListener.mock.calls[0][1]();

    await expectSendsMessageToParent([
      { action: "workspacesave", project: "", type: "pyeditor" },
      "*",
    ]);
  });

  it("triggers code changes on second listener", async () => {
    const host = new IframeHost(parentWindow, window, 0);
    host.notifyReady(fs);

    expect(mockAddListener.mock.calls.length).toEqual(2);
    mockAddListener.mock.calls[1][1]();

    await expectSendsMessageToParent([
      { action: "workspacesave", project: "", type: "pyeditor" },
      "*",
    ]);
  });
});

describe("DefaultHost", () => {
  it("uses migration if available", async () => {
    const project = await new DefaultHost(
      testMigrationUrl
    ).createInitialProject();
    expect(project).toEqual({
      isDefault: false,
      name: "Hearts",
      main: "from microbit import *\r\ndisplay.show(Image.HEART)",
    });
  });
  it("otherwise uses defaults", async () => {
    const project = await new DefaultHost("").createInitialProject();
    expect((project as SimplePythonProject).isDefault).toEqual(true);
  });
});

/**
 * @vitest-environment jsdom
 * @vitest-environment-options { "url": "http://localhost:3000?controller=1" }
 */
import { fromByteArray } from "base64-js";
import { vi } from "vitest";
import { MAIN_FILE, VersionAction } from "./fs";
import { IframeHost } from "./host";
import { waitFor } from "@testing-library/react";

describe("IframeHost", () => {
  const mockWrite = vi.fn();
  const mockAddListener = vi.fn();
  const fs = {
    read: () => new TextEncoder().encode("Code read!"),
    write: mockWrite,
    addEventListener: mockAddListener,
    getPythonProject: () => "",
  } as any;

  const mockPostMessage = vi.fn();
  const parentWindow = { postMessage: mockPostMessage } as any;

  delete (window as any).parent;
  (window as any).parent = parentWindow;

  const expectSendsMessageToParent = async (expected: any) =>
    waitFor(() => expect(mockPostMessage.mock.calls).toContainEqual(expected));

  const expectCodeWrite = async (expected: any) =>
    waitFor(() => expect(mockWrite.mock.calls).toContainEqual(expected));

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
    expect(project.files[MAIN_FILE]).toEqual(
      fromByteArray(new TextEncoder().encode("code1"))
    );
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
    await expectCodeWrite([MAIN_FILE, "code2", VersionAction.INCREMENT]);
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

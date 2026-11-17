/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ToastFn } from "@microbit/ui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConnectionError,
  ConnectionErrors,
  MessageConnection,
} from "vscode-jsonrpc";
import {
  InitializedNotification,
  InitializeParams,
  InitializeRequest,
} from "vscode-languageserver-protocol";
import { createUri, LanguageServerClient } from "./client";

const loadFailed = () =>
  new Error("Request initialize failed with message: Load failed");

const createClient = (locale: string = "fr") => {
  const sendRequest = vi.fn();
  const sendNotification = vi.fn();
  const connection = {
    sendRequest,
    sendNotification,
    onNotification: vi.fn(),
    onRequest: vi.fn(),
  } as unknown as MessageConnection;
  const toast = vi.fn();
  const client = new LanguageServerClient(
    connection,
    locale,
    createUri(""),
    toast as unknown as ToastFn
  );
  const requestedLocales = () =>
    sendRequest.mock.calls.map((call) => {
      const [type, params] = call as [unknown, InitializeParams];
      expect(type).toBe(InitializeRequest.type);
      return params.locale;
    });
  return { client, sendRequest, sendNotification, toast, requestedLocales };
};

describe("LanguageServerClient initialize", () => {
  let onLine: boolean;

  beforeEach(() => {
    onLine = true;
    vi.spyOn(navigator, "onLine", "get").mockImplementation(() => onLine);
    // Loading the real typeshed is slow and is I/O that fake timers can't
    // advance past.
    vi.spyOn(
      LanguageServerClient.prototype as any,
      "getInitializationOptions"
    ).mockResolvedValue({});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("retries when the server fails to initialize", async () => {
    const { client, sendRequest, sendNotification, toast, requestedLocales } =
      createClient();
    const capabilities = { hoverProvider: true };
    sendRequest
      .mockRejectedValueOnce(loadFailed())
      .mockRejectedValueOnce(loadFailed())
      .mockResolvedValueOnce({ capabilities });

    const result = client.initialize();
    await vi.runAllTimersAsync();

    expect(await result).toBe(true);
    expect(requestedLocales()).toEqual(["fr", "fr", "fr"]);
    expect(client.capabilities).toBe(capabilities);
    expect(sendNotification).toHaveBeenCalledExactlyOnceWith(
      InitializedNotification.type,
      {}
    );
    expect(toast).not.toHaveBeenCalled();
  });

  it("can be tried again after giving up", async () => {
    const { client, sendRequest } = createClient();
    sendRequest.mockRejectedValue(loadFailed());

    const failed = expect(client.initialize()).rejects.toThrow("Load failed");
    await vi.runAllTimersAsync();
    await failed;
    expect(sendRequest).toHaveBeenCalledTimes(5);

    sendRequest.mockReset().mockResolvedValue({ capabilities: {} });
    expect(await client.initialize()).toBe(true);
  });

  it("falls back to the precached locale when offline", async () => {
    const { client, sendRequest, toast, requestedLocales } = createClient();
    onLine = false;
    sendRequest
      .mockRejectedValueOnce(loadFailed())
      .mockResolvedValueOnce({ capabilities: {} });

    expect(await client.initialize()).toBe(true);
    expect(requestedLocales()).toEqual(["fr", "en"]);
    expect(client.locale).toBe("en");
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it("does not retry when the connection was disposed", async () => {
    const { client, sendRequest, sendNotification } = createClient();
    sendRequest.mockRejectedValue(
      new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.")
    );

    expect(await client.initialize()).toBe(false);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    expect(sendNotification).not.toHaveBeenCalled();
  });
});

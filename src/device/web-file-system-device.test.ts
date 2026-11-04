/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { afterEach, expect, it, vi } from "vitest";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { WebFileSystemConnection } from "./web-file-system-device";
import { CircuitPythonLibraryError } from "./circuitpython-library-error";
import { Logging } from "../logging/logging";

const devices: WebFileSystemConnection[] = [];
afterEach(async () => {
  await Promise.all(devices.splice(0).map((device) => device.disconnect()));
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function setup({
  reply = true,
  failWrite = false,
  failWriteCount = 0,
  failCloseAfterCommitCount = 0,
  failAt = "",
  failureName = "NoModificationAllowedError",
  replySync = true,
  syncMismatches = 0,
  echoSyncOnly = false,
  fragmentResponses = false,
  friendlyDelay = 0,
  rawError = "",
  startInRaw = false,
  syncResults = [] as number[],
  libraryFiles = undefined as ConstructorParameters<
    typeof WebFileSystemConnection
  >[0]["libraryFiles"],
  flushHostFiles = undefined as ConstructorParameters<
    typeof WebFileSystemConnection
  >[0]["flushHostFiles"],
  rebootOutput = "soft reboot\r\ncode.py output:\r\nPROGRAM STARTED\r\n",
} = {}) {
  const operations: string[] = [];
  const stored = new Map<string, Uint8Array>();
  let incoming: ReadableStreamDefaultController<Uint8Array>;
  let raw = startInRaw;
  let rawSource = "";
  const sources: string[] = [];
  let remainingWriteFailures = failWriteCount;
  let remainingCloseFailures = failCloseAfterCommitCount;
  const deliver = (text: string) => {
    const parts = fragmentResponses ? Array.from(text) : [text];
    for (const part of parts) incoming.enqueue(new TextEncoder().encode(part));
  };
  const port = {
    open: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    readable: new ReadableStream<Uint8Array>({
      start(controller) {
        incoming = controller;
      },
    }),
    writable: new WritableStream<Uint8Array>({
      write(data) {
        const text = new TextDecoder().decode(data);
        operations.push(text);
        if (text === "\x03\x03") {
          if (reply) deliver(raw ? ">" : ">>> ");
        } else if (text === "\x03\x03\x02") {
          raw = false;
          if (reply) deliver(">>> ");
        } else if (text === "\x01") {
          raw = true;
          if (reply) deliver("\r\nraw REPL; CTRL-B to exit\r\n>");
        } else if (text === "\x03\x02") {
          raw = false;
          if (friendlyDelay) setTimeout(() => deliver(">>> "), friendlyDelay);
          else deliver(">>> ");
        } else if (raw && text === "\x04") {
          operations.push("verify-files");
          sources.push(rawSource);
          if (echoSyncOnly) deliver(rawSource);
          else if (replySync)
            deliver(
              rawError
                ? `OK\x04${rawError}\x04>`
                : `OK${
                    syncResults.shift() ?? (syncMismatches-- > 0 ? 0 : 1)
                  }\r\n\x04\x04>`
            );
          rawSource = "";
        } else if (!raw && text === "\x04") {
          operations.push("soft-reboot");
          deliver(rebootOutput);
        } else if (raw) {
          rawSource += text;
        }
      },
    }),
  };
  const requestPort = vi.fn().mockResolvedValue(port);
  vi.stubGlobal("navigator", { serial: { requestPort } });
  const getFileHandle = vi.fn(
    async (name: string, options?: { create?: boolean }) => {
      if (name === "boot_out.txt")
        return {
          getFile: async () => ({
            text: async () => "Adafruit CircuitPython 10.3.0",
          }),
        };
      const fail = (operation: string) => {
        if (failAt === operation)
          throw new DOMException(
            "Underlying filesystem is read-only",
            failureName
          );
      };
      fail("open-file");
      if (!stored.has(name)) {
        if (!options?.create)
          throw new DOMException("Missing", "NotFoundError");
        stored.set(name, new Uint8Array());
      }
      return {
        getFile: async () => {
          fail("read-file");
          const data = stored.get(name) ?? new Uint8Array();
          return {
            size: data.length,
            arrayBuffer: async () => data.slice().buffer,
          };
        },
        createWritable: async () => {
          let pending: Uint8Array | undefined;
          fail("create-writer");
          return {
            write: async (data: Uint8Array) => {
              fail("write-file");
              if (failWrite || remainingWriteFailures-- > 0)
                throw new DOMException("Device removed", "NotFoundError");
              pending = data.slice();
              operations.push(`${name}:${new TextDecoder().decode(data)}`);
            },
            close: async () => {
              fail("close-file");
              if (pending) stored.set(name, pending);
              if (remainingCloseFailures-- > 0)
                throw new DOMException(
                  "Replacement status lost",
                  "UnknownError"
                );
              operations.push(`close:${name}`);
            },
            abort: vi.fn(async () => {
              if (failAt === "close-file")
                throw new DOMException("Already closed", "InvalidStateError");
            }),
          };
        },
      };
    }
  );
  const directory = (prefix = ""): FileSystemDirectoryHandle =>
    ({
      kind: "directory",
      name: prefix ? prefix.split("/").slice(-2)[0] : "CIRCUITPY",
      getFileHandle: (name: string, options?: { create?: boolean }) =>
        options
          ? getFileHandle(prefix + name, options)
          : getFileHandle(prefix + name),
      getDirectoryHandle: async (name: string) =>
        directory(prefix + name + "/"),
    } as unknown as FileSystemDirectoryHandle);
  const picker = vi.fn().mockResolvedValue(directory());
  vi.stubGlobal("showDirectoryPicker", picker);
  const files = vi
    .fn<() => Promise<Record<string, Uint8Array>>>()
    .mockResolvedValue({
      "code.py": new TextEncoder().encode('print("Hallo")'),
      "sensor.py": new TextEncoder().encode("value = 1"),
    });
  const logging = { event: vi.fn(), error: vi.fn() } as unknown as Logging;
  const device = new WebFileSystemConnection({
    logging,
    files,
    flushHostFiles,
    libraryFiles,
  });
  devices.push(device);
  return {
    device,
    files,
    port,
    picker,
    getFileHandle,
    operations,
    sources,
    stored,
    requestPort,
    incoming: () => incoming,
  };
}

it("connects once without selecting a folder or transferring any code", async () => {
  const { device, requestPort, files, picker, operations } = setup();
  await device.connect();
  await device.connect();
  expect(device.status).toBe(ConnectionStatus.Connected);
  expect(requestPort).toHaveBeenCalledTimes(1);
  expect(requestPort).toHaveBeenCalledWith({
    filters: [
      { usbVendorId: 0x303a, usbProductId: 0x81b8 },
      { usbVendorId: 0x303a, usbProductId: 0x81b9 },
      { usbVendorId: 0x303a, usbProductId: 0x81ba },
    ],
  });
  expect(picker).not.toHaveBeenCalled();
  expect(files).not.toHaveBeenCalled();
  expect(operations).toEqual([]);
});

it("reports ordered transfer phases and file-local progress before confirming success", async () => {
  const transferProgress = vi.fn();
  const { device, operations } = setup();
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = device.flash(vi.fn(), { transferProgress });
  await vi.advanceTimersByTimeAsync(4000);
  await transfer;
  expect(transferProgress.mock.calls.map(([state]) => state.phase)).toEqual([
    "libraries",
    "board",
    "files",
    "files",
    "files",
    "flush",
    "verify",
    "start",
  ]);
  expect(
    transferProgress.mock.calls
      .filter(([state]) => state.phase === "files")
      .map(([state]) => [state.completed, state.total])
  ).toEqual([
    [0, 2],
    [1, 2],
    [2, 2],
  ]);
  expect(operations).toContain("verify-files");
  expect(operations).toContain("soft-reboot");
});

it("never reports program start when file verification fails", async () => {
  const transferProgress = vi.fn();
  const { device, operations } = setup({ syncMismatches: 1000 });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = expect(
    device.flash(vi.fn(), { transferProgress })
  ).rejects.toMatchObject({ code: "sync" });
  await vi.advanceTimersByTimeAsync(65000);
  await transfer;
  expect(
    transferProgress.mock.calls[transferProgress.mock.calls.length - 1]?.[0]
      .phase
  ).toBe("verify");
  expect(operations).not.toContain("soft-reboot");
});

it("forwards terminal input and device output over the same connection", async () => {
  const { device, operations, incoming } = setup();
  const listener = vi.fn();
  device.addEventListener("serialdata", listener);
  await device.connect();
  await device.serialWrite("print(123)\r");
  incoming().enqueue(new TextEncoder().encode("123\r\n"));
  await vi.waitFor(() =>
    expect(listener).toHaveBeenCalledWith({ data: "123\r\n" })
  );
  expect(operations).toEqual(["print(123)\r"]);
});

it("writes dependencies and code.py after stopping, closes them before restarting, and reuses the folder", async () => {
  const { device, operations, picker } = setup();
  const flashed = vi.fn();
  device.addEventListener("flash", flashed);
  await device.connect();
  await device.selectDirectory();
  const hex = vi.fn();
  await device.flash(hex, {});
  const milestones = operations.filter(
    (entry) =>
      entry.startsWith("sensor.py:") ||
      entry.startsWith("code.py:") ||
      entry.startsWith("close:") ||
      entry === "verify-files" ||
      entry === "soft-reboot"
  );
  expect(
    milestones.filter(
      (entry, index) =>
        entry !== "verify-files" || milestones[index - 1] !== entry
    )
  ).toEqual([
    "sensor.py:value = 1",
    "close:sensor.py",
    'code.py:print("Hallo")',
    "close:code.py",
    "verify-files",
    "soft-reboot",
  ]);
  const exit = operations.indexOf("\x03\x02");
  expect(exit).toBeGreaterThan(operations.indexOf("verify-files"));
  expect(exit).toBeLessThan(operations.indexOf("soft-reboot"));
  expect(hex).not.toHaveBeenCalled();
  expect(flashed).toHaveBeenCalledTimes(1);
  await device.flash(hex, {});
  expect(picker).toHaveBeenCalledTimes(1);
  expect(flashed).toHaveBeenCalledTimes(2);
});

it("rejects a folder without the CircuitPython marker without creating any file", async () => {
  const { device, getFileHandle } = setup();
  getFileHandle.mockRejectedValue(new DOMException("Missing", "NotFoundError"));
  await expect(device.selectDirectory()).rejects.toMatchObject({
    code: "wrong-directory",
  });
  expect(device.hasDirectory).toBe(false);
  expect(getFileHandle).toHaveBeenCalledExactlyOnceWith("boot_out.txt");
});

it.each(["code.py", "CIRCUITPY"])(
  "rejects a file handle named %s before reading or writing files",
  async (name) => {
    const { device, picker, getFileHandle, operations } = setup();
    picker.mockResolvedValueOnce({ kind: "file", name, getFileHandle });
    await expect(device.selectDirectory()).rejects.toMatchObject({
      code: "wrong-directory",
    });
    expect(device.hasDirectory).toBe(false);
    expect(getFileHandle).not.toHaveBeenCalled();
    expect(operations).toEqual([]);
    // A corrected root selection succeeds without selecting any individual file.
    expect(await device.selectDirectory()).toBe(true);
    expect(device.hasDirectory).toBe(true);
  }
);

it.each(["lib", "Downloads", "CIRCUITPY_BACKUP"])(
  "rejects a directory named %s when it has no CircuitPython marker",
  async (name) => {
    const { device, picker, getFileHandle, operations } = setup();
    picker.mockResolvedValueOnce({ kind: "directory", name, getFileHandle });
    getFileHandle.mockRejectedValueOnce(
      new DOMException("Missing", "NotFoundError")
    );
    await expect(device.selectDirectory()).rejects.toMatchObject({
      code: "wrong-directory",
    });
    expect(device.hasDirectory).toBe(false);
    expect(getFileHandle).toHaveBeenCalledExactlyOnceWith("boot_out.txt");
    expect(operations).toEqual([]);
  }
);

it("accepts the CIRCUITPY root using only the directory picker, regardless of case", async () => {
  const { device, picker, getFileHandle, operations } = setup();
  picker.mockResolvedValue({
    kind: "directory",
    name: "circuitpy",
    getFileHandle,
  });
  expect(await device.selectDirectory()).toBe(true);
  expect(picker).toHaveBeenCalledExactlyOnceWith({
    mode: "readwrite",
    id: "circuitpy",
  });
  expect(getFileHandle).toHaveBeenCalledExactlyOnceWith("boot_out.txt");
  expect(device.hasDirectory).toBe(true);
  expect(operations).toEqual([]);
});

it.each(["D:", "d:\\", "CIRCUITPY (D:)", "USB Drive"])(
  "accepts a Windows drive-root display name %s when it contains the CircuitPython marker",
  async (name) => {
    const { device, picker, getFileHandle, operations } = setup();
    picker.mockResolvedValue({
      kind: "directory",
      name,
      getFileHandle,
    });
    expect(await device.selectDirectory()).toBe(true);
    expect(getFileHandle).toHaveBeenCalledExactlyOnceWith("boot_out.txt");
    expect(device.hasDirectory).toBe(true);
    expect(operations).toEqual([]);
  }
);

it("handles picker cancellation without claiming a connection or directory", async () => {
  const { device, requestPort, picker } = setup();
  requestPort.mockRejectedValue(new DOMException("Cancelled", "NotFoundError"));
  await device.connect();
  expect(device.status).toBe(ConnectionStatus.NoAuthorizedDevice);
  picker.mockRejectedValue(new DOMException("Cancelled", "AbortError"));
  expect(await device.selectDirectory()).toBe(false);
  expect(device.hasDirectory).toBe(false);
});

it("does not write anything unless the board confirms the REPL prompt", async () => {
  const { device, operations } = setup({ reply: false });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const result = expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "repl",
  });
  await vi.advanceTimersByTimeAsync(3000);
  await result;
  expect(operations).toEqual(["\x03\x03\x02"]);
});

it("reports write failure, forgets the stale directory and does not restart or report success", async () => {
  const { device, operations } = setup({ failWrite: true });
  const flashed = vi.fn();
  device.addEventListener("flash", flashed);
  await device.connect();
  await device.selectDirectory();
  await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "write",
  });
  expect(device.hasDirectory).toBe(false);
  expect(operations).not.toContain("soft-reboot");
  expect(flashed).not.toHaveBeenCalled();
});

it("retries a transient Windows removable-drive write failure", async () => {
  const { device, operations, stored } = setup({ failWriteCount: 1 });
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(stored.get("sensor.py")).toEqual(
    new TextEncoder().encode("value = 1")
  );
  expect(operations).toContain("soft-reboot");
  expect(device.hasDirectory).toBe(true);
});

it("rechecks the file when Windows reports failure after committing close", async () => {
  const flushHostFiles = vi.fn<
    NonNullable<
      ConstructorParameters<typeof WebFileSystemConnection>[0]["flushHostFiles"]
    >
  >(async () => {});
  const { device, files, stored } = setup({
    failCloseAfterCommitCount: 1,
    flushHostFiles,
  });
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(stored.get("sensor.py")).toEqual(
    new TextEncoder().encode("value = 1")
  );
  expect(flushHostFiles.mock.calls[0][1]).toContainEqual([
    "sensor.py",
    (await files())["sensor.py"],
  ]);
});

it("clears the connection and folder when unplugged", async () => {
  const { device, incoming } = setup();
  await device.connect();
  await device.selectDirectory();
  incoming().error(new Error("Unplugged"));
  await vi.waitFor(() =>
    expect(device.status).toBe(ConnectionStatus.Disconnected)
  );
  expect(device.hasDirectory).toBe(false);
  await expect(device.serialWrite("x")).rejects.toMatchObject({
    code: "not-connected",
  });
});

it.each([
  "open-file",
  "read-file",
  "create-writer",
  "write-file",
  "close-file",
])(
  "reports the real read-only filesystem error at %s without restarting or reporting success",
  async (operation) => {
    const { device, operations } = setup({ failAt: operation });
    const flashed = vi.fn();
    device.addEventListener("flash", flashed);
    await device.connect();
    await device.selectDirectory();
    await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
      code: "filesystem-state",
      cause: { name: "NoModificationAllowedError" },
      file: { fileName: "sensor.py", operation },
    });
    expect(device.hasDirectory).toBe(false);
    expect(operations).not.toContain("soft-reboot");
    expect(operations.some((entry) => entry.startsWith("code.py:"))).toBe(
      false
    );
    expect(flashed).not.toHaveBeenCalled();
  }
);

it.each([
  ["NotAllowedError", "permission"],
  ["SecurityError", "permission"],
  ["QuotaExceededError", "storage-full"],
  ["NotFoundError", "write"],
])(
  "distinguishes %s from a read-only filesystem",
  async (failureName, code) => {
    const { device } = setup({ failAt: "create-writer", failureName });
    await device.connect();
    await device.selectDirectory();
    await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
      code,
      file: { fileName: "sensor.py", operation: "create-writer" },
      cause: { name: failureName },
    });
  }
);

it("waits for delayed USB writes to become visible on the board before restarting", async () => {
  const { device, operations } = setup({ syncMismatches: 2 });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = device.flash(vi.fn(), {});
  await vi.advanceTimersByTimeAsync(100);
  expect(operations).not.toContain("soft-reboot");
  await vi.advanceTimersByTimeAsync(3500);
  await transfer;
  expect(
    operations.filter((entry) => entry === "verify-files").length
  ).toBeGreaterThan(3);
  expect(operations[operations.length - 1]).toBe("soft-reboot");
});

it.each([false, true])(
  "does not mistake an echoed verification command for board acknowledgement (echo only: %s)",
  async (echoSyncOnly) => {
    const { device, operations } = setup({ replySync: false, echoSyncOnly });
    const flashed = vi.fn();
    device.addEventListener("flash", flashed);
    await device.connect();
    await device.selectDirectory();
    vi.useFakeTimers();
    const result = expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
      code: "sync",
    });
    await vi.advanceTimersByTimeAsync(5000);
    await result;
    expect(operations).not.toContain("soft-reboot");
    expect(flashed).not.toHaveBeenCalled();
  }
);

it("does not restart when matching host files still appear stale on the board", async () => {
  const { device, operations, stored, files } = setup({ syncMismatches: 1000 });
  for (const [name, bytes] of Object.entries(await files()))
    stored.set(name, bytes.slice());
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const result = expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "sync",
  });
  await vi.advanceTimersByTimeAsync(60000);
  await result;
  expect(operations).not.toContain("soft-reboot");
});

it("keeps internal verification responses out of the visible terminal", async () => {
  const { device } = setup();
  const terminal = vi.fn();
  device.addEventListener("serialdata", terminal);
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(
    terminal.mock.calls.some(
      ([event]) =>
        event.data.includes("raw REPL") ||
        event.data.includes("print(int(_ok))")
    )
  ).toBe(false);
});

it("handles byte-fragmented raw REPL frames and shows program output after the soft reboot", async () => {
  const { device, sources, operations } = setup({ fragmentResponses: true });
  const terminal = vi.fn();
  device.addEventListener("serialdata", terminal);
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(sources[0]).toContain('["/sensor.py"');
  expect(sources[0]).toContain('["/code.py"');
  expect(sources[0]).not.toContain("exec(");
  expect(operations).toContain("soft-reboot");
  await vi.waitFor(() =>
    expect(terminal.mock.calls.map(([event]) => event.data).join("")).toContain(
      "PROGRAM STARTED"
    )
  );
});

it("waits for the normal REPL prompt before sending the reboot Ctrl-D", async () => {
  const { device, operations } = setup({ friendlyDelay: 500 });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = device.flash(vi.fn(), {});
  await vi.advanceTimersByTimeAsync(1500);
  expect(operations).toContain("\x03\x02");
  expect(operations).not.toContain("soft-reboot");
  await vi.advanceTimersByTimeAsync(2000);
  await transfer;
  expect(operations).toContain("soft-reboot");
});

it("preserves raw execution errors and restores normal REPL without restarting", async () => {
  const { device, operations } = setup({
    rawError: "SyntaxError: invalid syntax",
  });
  await device.connect();
  await device.selectDirectory();
  await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "sync",
    cause: { message: "SyntaxError: invalid syntax" },
  });
  expect(operations).toContain("\x03\x02");
  expect(operations).not.toContain("soft-reboot");
});

it("can transfer after a previous session left the board in Raw REPL", async () => {
  const { device, operations } = setup({ startInRaw: true });
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(operations[0]).toBe("\x03\x03\x02");
  expect(operations).toContain("soft-reboot");
});

it("requires stable matching files again after a transient successful read", async () => {
  const { device, operations } = setup({ syncResults: [1, 0, 1] });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = device.flash(vi.fn(), {});
  await vi.advanceTimersByTimeAsync(1100);
  expect(operations).not.toContain("soft-reboot");
  await vi.advanceTimersByTimeAsync(3000);
  await transfer;
  expect(operations).toContain("soft-reboot");
});

it("allows host writes to take longer than the previous 15-second deadline", async () => {
  const { device, operations } = setup({ syncMismatches: 100 });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = device.flash(vi.fn(), {});
  await vi.advanceTimersByTimeAsync(15000);
  expect(operations).not.toContain("soft-reboot");
  await vi.advanceTimersByTimeAsync(35000);
  await transfer;
  expect(operations).toContain("soft-reboot");
});

it.each([
  "weicher reboot\r\n\x1b[2K\x1b[0Gcode.py Ausgabe:\r\n\x1b]0;🐍 code.py\x1b\\OSError: [Errno 5] Eingabe-/Ausgabefehler\r\n",
  "soft reboot\r\ncode.py output:\r\nOSError: [Errno 5] Input/output error\r\n",
])(
  "does not report transfer success after the immediate file-load error: %s",
  async (rebootOutput) => {
    const { device, operations } = setup({
      rebootOutput,
      fragmentResponses: true,
    });
    const flashed = vi.fn();
    const terminal = vi.fn();
    device.addEventListener("flash", flashed);
    device.addEventListener("serialdata", terminal);
    await device.connect();
    await device.selectDirectory();
    await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
      code: "start",
    });
    expect(operations.filter((entry) => entry === "soft-reboot")).toHaveLength(
      1
    );
    expect(flashed).not.toHaveBeenCalled();
    expect(device.hasDirectory).toBe(true);
    expect(terminal.mock.calls.map(([event]) => event.data).join("")).toContain(
      "OSError: [Errno 5]"
    );
  }
);

it("leaves user program errors in the console without treating them as file-load failures", async () => {
  const { device } = setup({
    rebootOutput:
      'soft reboot\r\ncode.py output:\r\nTraceback (most recent call last):\r\n  File "code.py", line 2, in <module>\r\nOSError: [Errno 5] Input/output error\r\n',
  });
  await device.connect();
  await device.selectDirectory();
  await expect(device.flash(vi.fn(), {})).resolves.toBeUndefined();
});

it("skips byte-identical binary files but still verifies the board and restarts", async () => {
  const { device, files, stored, operations, sources } = setup();
  const content = new Uint8Array([0, 128, 255, 10]);
  files.mockResolvedValue({ "code.py": content });
  stored.set("code.py", content.slice());
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(
    operations.some(
      (entry) => entry.startsWith("code.py:") || entry.startsWith("close:")
    )
  ).toBe(false);
  expect(sources[0]).toContain('["/code.py",4,');
  expect(operations).toContain("verify-files");
  expect(operations).toContain("soft-reboot");
});

it("writes a same-length changed file and leaves equal dependencies untouched", async () => {
  const { device, files, stored, operations } = setup();
  files.mockResolvedValue({
    "code.py": new Uint8Array([1, 255]),
    "sensor.py": new Uint8Array([3, 4]),
  });
  stored.set("code.py", new Uint8Array([1, 254]));
  stored.set("sensor.py", new Uint8Array([3, 4]));
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(operations.filter((entry) => entry.startsWith("close:"))).toEqual([
    "close:code.py",
  ]);
  expect(stored.get("code.py")).toEqual(new Uint8Array([1, 255]));
});

it.each(["modified", "deleted"])(
  "rechecks targets after another editor has %s a file",
  async (change) => {
    const { device, files, stored, operations } = setup();
    const content = new Uint8Array([1, 2]);
    files.mockResolvedValue({ "code.py": content });
    stored.set("code.py", content.slice());
    await device.connect();
    await device.selectDirectory();
    vi.useFakeTimers();
    let transfer = device.flash(vi.fn(), {});
    await vi.advanceTimersByTimeAsync(4000);
    await transfer;
    if (change === "modified") stored.set("code.py", new Uint8Array([1, 3]));
    else stored.delete("code.py");
    operations.length = 0;
    transfer = device.flash(vi.fn(), {});
    await vi.advanceTimersByTimeAsync(4000);
    await transfer;
    expect(operations).toContain("close:code.py");
    expect(stored.get("code.py")).toEqual(content);
  }
);

it("flushes changed and identical required files before MCU verification without rewriting identical bytes", async () => {
  const flushHostFiles = vi.fn<
    NonNullable<
      ConstructorParameters<typeof WebFileSystemConnection>[0]["flushHostFiles"]
    >
  >(async () => {
    operations.push("flush-host");
  });
  const { device, files, stored, operations } = setup({ flushHostFiles });
  stored.set("sensor.py", new TextEncoder().encode("value = 1"));
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(flushHostFiles.mock.calls[0][1]).toEqual([
    ["sensor.py", (await files())["sensor.py"]],
    ["code.py", (await files())["code.py"]],
  ]);
  expect(operations.indexOf("flush-host")).toBeGreaterThan(
    operations.indexOf("close:code.py")
  );
  expect(operations.indexOf("flush-host")).toBeLessThan(
    operations.indexOf("verify-files")
  );
  flushHostFiles.mockClear();
  operations.length = 0;
  vi.useFakeTimers();
  const repeat = device.flash(vi.fn(), {});
  await vi.advanceTimersByTimeAsync(4000);
  await repeat;
  expect(flushHostFiles).toHaveBeenCalledOnce();
  expect(flushHostFiles.mock.calls[0][1]).toHaveLength(2);
  expect(operations.some((entry) => entry.startsWith("close:"))).toBe(false);
  expect(operations.indexOf("flush-host")).toBeLessThan(
    operations.indexOf("verify-files")
  );
});

it("flushes pending equal files on retry after an unavailable helper and failed MCU verification", async () => {
  const syncResults: number[] = [];
  let attempts = 0;
  const flushHostFiles = vi.fn(async () => {
    if (++attempts === 1)
      throw new Error("Local helper temporarily unavailable");
    syncResults.push(...Array<number>(10).fill(1));
  });
  const { device, operations } = setup({
    flushHostFiles,
    syncResults,
    syncMismatches: 1000,
  });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const first = expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "sync",
  });
  await vi.advanceTimersByTimeAsync(65000);
  await first;
  expect(operations).not.toContain("soft-reboot");
  operations.length = 0;
  const retry = device.flash(vi.fn(), {});
  await vi.advanceTimersByTimeAsync(4000);
  await retry;
  expect(flushHostFiles).toHaveBeenCalledTimes(2);
  expect(operations.some((entry) => entry.startsWith("close:"))).toBe(false);
  expect(operations).toContain("verify-files");
  expect(operations).toContain("soft-reboot");
});

it("still verifies the MCU when the optional host flush fails", async () => {
  const flushHostFiles = vi.fn().mockRejectedValue(new Error("No helper"));
  const { device, operations } = setup({ flushHostFiles });
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(flushHostFiles).toHaveBeenCalledOnce();
  expect(operations).toContain("verify-files");
  expect(operations).toContain("soft-reboot");
});

it("does not reboot on a host flush acknowledgement without matching MCU contents", async () => {
  const flushHostFiles = vi.fn(async () => {});
  const { device, operations } = setup({
    flushHostFiles,
    syncMismatches: 1000,
  });
  await device.connect();
  await device.selectDirectory();
  vi.useFakeTimers();
  const transfer = expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "sync",
  });
  await vi.advanceTimersByTimeAsync(60000);
  await transfer;
  expect(flushHostFiles).toHaveBeenCalledOnce();
  expect(operations).not.toContain("soft-reboot");
});

it("writes automatic nested libraries before code.py and includes them in the MCU check", async () => {
  const libraryFiles = vi.fn(async () => ({
    "lib/driver/__init__.py": new Uint8Array(),
    "lib/driver/core.mpy": new Uint8Array([67, 6]),
  }));
  const { device, operations, sources, stored } = setup({ libraryFiles });
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(operations.indexOf("close:lib/driver/core.mpy")).toBeLessThan(
    operations.indexOf("close:code.py")
  );
  expect(stored.has("lib/driver/__init__.py")).toBe(true);
  expect(sources[0]).toContain("/lib/driver/core.mpy");
  expect(operations).toContain("soft-reboot");
});

it("preserves user project files over generated dependencies and skips existing empty files", async () => {
  const libraryFiles = vi.fn(async () => ({
    "sensor.py": new TextEncoder().encode("generated"),
    "lib/empty.py": new Uint8Array(),
  }));
  const { device, operations, stored } = setup({ libraryFiles });
  stored.set("lib/empty.py", new Uint8Array());
  await device.connect();
  await device.selectDirectory();
  await device.flash(vi.fn(), {});
  expect(stored.get("sensor.py")).toEqual(
    new TextEncoder().encode("value = 1")
  );
  expect(operations).not.toContain("close:lib/empty.py");
});

it("does not stop, write or restart the board when preparing a library fails", async () => {
  const libraryFiles = vi
    .fn()
    .mockRejectedValue(
      new CircuitPythonLibraryError("adafruit_ssd1306", new Error("Offline"))
    );
  const { device, operations } = setup({ libraryFiles });
  await device.connect();
  await device.selectDirectory();
  await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "library",
    moduleName: "adafruit_ssd1306",
  });
  expect(operations).toEqual([]);
  expect(device.hasDirectory).toBe(true);
});

it("rejects traversal in nested project files without creating or writing them", async () => {
  const { device, files, operations } = setup();
  files.mockResolvedValue({ "lib/../bad.py": new Uint8Array([1]) });
  await device.connect();
  await device.selectDirectory();
  await expect(device.flash(vi.fn(), {})).rejects.toMatchObject({
    code: "write",
    file: { fileName: "lib/../bad.py", operation: "open-file" },
  });
  expect(operations).not.toContain("soft-reboot");
});

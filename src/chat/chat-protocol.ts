/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * The microchat wire protocol.
 *
 * The `microchat` Python module frames the messages a program sends in
 * ANSI "APC" strings: ESC _ <payload> ESC \. Terminals ignore APC
 * strings, so they never show up as junk in a plain REPL, but we watch
 * for them here to drive the chat UI and to detect that a chat is in
 * progress.
 *
 * The payload is `microchat;<version>;<kind>;<text>` where kind is one of
 * `start`, `msg` or `stop`.
 */

export const APC = "\x1b_";
export const ST = "\x1b\\";
export const TAG = "microchat;1;";

export type ChatFrame =
  | { kind: "start"; name: string }
  | { kind: "msg"; text: string }
  | { kind: "stop" };

const parseBody = (body: string): ChatFrame => {
  const sep = body.indexOf(";");
  const kind = sep === -1 ? body : body.slice(0, sep);
  const rest = sep === -1 ? "" : body.slice(sep + 1);
  switch (kind) {
    case "start":
      return { kind: "start", name: rest };
    case "msg":
      return { kind: "msg", text: rest };
    default:
      return { kind: "stop" };
  }
};

/**
 * Incrementally extracts microchat frames from a serial stream.
 *
 * Frames can straddle the chunks delivered by "serialdata" events, so we
 * keep a small buffer between calls. Follows the same buffered-scan
 * approach as {@link TracebackScrollback}.
 */
export class ChatParser {
  private buf = "";
  private static readonly marker = APC + TAG;
  // Cap the buffer so a stray, never-terminated APC introducer can't grow
  // it without bound.
  private static readonly limit = 8192;

  push(data: string): ChatFrame[] {
    this.buf += data;
    const frames: ChatFrame[] = [];
    for (;;) {
      const start = this.buf.indexOf(ChatParser.marker);
      if (start === -1) {
        // No frame in flight. Keep only a short tail in case a marker is
        // split across the boundary of the next chunk.
        const keep = ChatParser.marker.length - 1;
        if (this.buf.length > keep) {
          this.buf = this.buf.slice(this.buf.length - keep);
        }
        break;
      }
      const contentStart = start + ChatParser.marker.length;
      const end = this.buf.indexOf(ST, contentStart);
      if (end === -1) {
        // Incomplete frame: drop everything before it and wait for more.
        this.buf = this.buf.slice(start);
        if (this.buf.length > ChatParser.limit) {
          this.buf = "";
        }
        break;
      }
      frames.push(parseBody(this.buf.slice(contentStart, end)));
      this.buf = this.buf.slice(end + ST.length);
    }
    return frames;
  }

  clear() {
    this.buf = "";
  }
}

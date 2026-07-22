/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { SerialData } from "@microbit/microbit-connection/usb";
import { useDevice } from "../device/device-hooks";
import { ChatParser } from "./chat-protocol";

export interface ChatMessage {
  id: number;
  from: "bot" | "you";
  text: string;
}

export interface ChatSession {
  /** True while a microchat program is running (start seen, stop not yet). */
  active: boolean;
  /** Name the running program gave itself. */
  botName: string;
  messages: ChatMessage[];
  /** Send a line of input to the program (as the person's reply). */
  send: (text: string) => void;
}

const emptyState = (): Omit<ChatSession, "send"> => ({
  active: false,
  botName: "bot",
  messages: [],
});

/**
 * Watches the serial stream for the microchat protocol and exposes the
 * conversation to the UI.
 *
 * Works identically for the real device and the simulator because both
 * dispatch the same "serialdata"/"serialreset" events.
 */
export const useChatSession = (): ChatSession => {
  const device = useDevice();
  const [state, setState] = useState(emptyState);
  const nextId = useRef(0);

  useEffect(() => {
    const parser = new ChatParser();
    // A short tail of recent output, used to spot an interrupt.
    let tail = "";
    const dataListener = (event: SerialData) => {
      const frames = parser.push(event.data);
      // A `KeyboardInterrupt` traceback means the program was stopped
      // mid-run (Ctrl-C on the device, or the Stop button in the simulator)
      // without a chance to send a `stop` frame. End the chat so we don't
      // leave the chat view wired to a dead program. We key off the
      // interrupt rather than the returning ">>> " prompt so that a chat
      // driven from the REPL isn't ended by its own prompt.
      tail = (tail + event.data).slice(-64);
      const interrupted = tail.includes("KeyboardInterrupt");
      if (interrupted) {
        tail = "";
      }
      if (frames.length === 0 && !interrupted) {
        return;
      }
      setState((prev) => {
        if (!prev.active && frames.length === 0) {
          return prev;
        }
        let { active, botName, messages } = prev;
        for (const frame of frames) {
          switch (frame.kind) {
            case "start":
              active = true;
              botName = frame.name || "bot";
              messages = [];
              break;
            case "msg":
              messages = [
                ...messages,
                { id: nextId.current++, from: "bot", text: frame.text },
              ];
              break;
            case "stop":
              active = false;
              break;
          }
        }
        // Don't end a chat that (re)started in this same batch.
        if (interrupted && !frames.some((f) => f.kind === "start")) {
          active = false;
        }
        return { active, botName, messages };
      });
    };
    const resetListener = () => {
      parser.clear();
      tail = "";
      // Just mark the chat inactive. Don't reset the bot name / messages to
      // defaults or a restart flashes "bot" and an empty log before the new
      // `start` frame arrives; a real new program's `start` frame replaces
      // them anyway.
      setState((prev) => (prev.active ? { ...prev, active: false } : prev));
    };
    device.addEventListener("serialdata", dataListener);
    device.addEventListener("serialreset", resetListener);
    return () => {
      device.removeEventListener("serialdata", dataListener);
      device.removeEventListener("serialreset", resetListener);
    };
  }, [device]);

  const send = useCallback(
    (text: string) => {
      // Same path the terminal uses; the microchat module reads a line
      // terminated by newline.
      device.serialWrite(text + "\r\n");
      setState((prev) =>
        prev.active
          ? {
              ...prev,
              messages: [
                ...prev.messages,
                { id: nextId.current++, from: "you", text },
              ],
            }
          : prev
      );
    },
    [device]
  );

  return { ...state, send };
};

/**
 * A signal that increments each time a freshly-flashed program starts a
 * chat.
 *
 * Use it to reveal the chat UI (switch view / open / expand the serial
 * area) only for a new program - not on restarts (Ctrl-D) or the simulator
 * reset button, which don't flash and so shouldn't override the view or
 * size the user has chosen.
 */
export const useChatRevealSignal = (chatActive: boolean): number => {
  const device = useDevice();
  const [signal, setSignal] = useState(0);
  const flashPending = useRef(false);
  useEffect(() => {
    const onFlash = () => {
      flashPending.current = true;
    };
    device.addEventListener("flash", onFlash);
    return () => device.removeEventListener("flash", onFlash);
  }, [device]);
  useEffect(() => {
    if (chatActive && flashPending.current) {
      flashPending.current = false;
      setSignal((s) => s + 1);
    }
  }, [chatActive]);
  return signal;
};

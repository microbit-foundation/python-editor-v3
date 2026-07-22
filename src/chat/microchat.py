# microbit-module: microchat@0.2.0
"""microchat - a tiny chat helper for the BBC micro:bit.

Have a "chat" with the person using the micro:bit. In the Python Editor
the conversation is drawn as a chat window instead of the plain REPL; on
an ordinary serial terminal the control markers are invisible and you
just see the messages as text.

Blocking style (reads top-to-bottom like a script)::

    from microbit import *
    from microchat import *

    chat.start("micro:bot")
    name = chat.ask("Hi! What's your name?")   # waits for a reply
    chat.say("Nice to meet you, " + name)

Polling style (works like the radio module)::

    from microbit import *
    from microchat import *

    chat.start("micro:bot")
    while True:
        msg = chat.receive()             # a line of text, or None
        if msg:
            chat.say("You said: " + msg)
        if button_a.was_pressed():
            chat.say("Button A pressed!")  # chat + sensors together
        sleep(50)

The method names mirror ``radio`` on purpose: start/stop, send/receive.
``say`` and ``ask`` are friendlier aliases for beginners.
"""

from microbit import uart, sleep

__all__ = ["ChatBot", "chat"]

# Each message the bot sends is wrapped in an ANSI "APC" string:
#   ESC _  <payload>  ESC \
# Terminals ignore APC strings (so they never appear as junk text), and
# the Python Editor watches for them to draw the chat window and to know
# a chat is in progress. The payload is "microchat;<version>;<kind>;<text>".
_APC = "\x1b_"
_ST = "\x1b\\"
_TAG = "microchat;1;"


class ChatBot:
    """A chat session over the micro:bit's USB serial connection.

    :param name: name shown before the bot's messages (default "bot").
    """

    def __init__(self, name="bot"):
        self._name = name
        self._buf = b""        # bytes received but not yet a full line
        self._lines = []       # finished lines waiting to be read
        self._started = False

    # ---- lifecycle (mirrors radio.on / radio.off) ----------------------

    def start(self, name=None):
        """Begin a chat session. Call this once before say/ask/receive."""
        if name is not None:
            self._name = name
        # 115200 with no tx/rx pins keeps the UART on the USB connection,
        # which is the same one the editor's chat/REPL window uses.
        uart.init(115200)
        self._started = True
        self._frame("start", self._name)
        return self

    on = start

    def stop(self):
        """End the session and return to the normal REPL."""
        self._frame("stop")
        self._started = False

    off = stop

    # ---- sending (bot -> person) ---------------------------------------

    def say(self, message):
        """Send a message from the bot."""
        if not self._started:
            self.start()
        self._frame("msg", str(message))

    send = say

    # ---- receiving (person -> bot) -------------------------------------

    def receive(self):
        """Return the next line typed by the person, or None.

        Does not block - call it from your main loop.
        """
        self._pump()
        if self._lines:
            return self._lines.pop(0)
        return None

    def ask(self, prompt=None):
        """Send an optional prompt, then wait until the person replies."""
        if prompt is not None:
            self.say(prompt)
        while True:
            line = self.receive()
            if line is not None:
                return line
            sleep(10)

    # ---- internals -----------------------------------------------------

    def _frame(self, kind, text=""):
        # ESC can't appear inside an APC string, so drop any in the text.
        text = text.replace("\x1b", "")
        uart.write(_APC + _TAG + kind + ";" + text + _ST)

    def _pump(self):
        """Turn whatever bytes have arrived into finished lines."""
        if not self._started:
            self.start()
        if uart.any():
            data = uart.read()
            if data:
                self._buf += data
        # The editor sends each reply followed by a newline. No echo or
        # backspace handling is needed here - the editor's chat box takes
        # care of that before sending a finished line.
        while b"\n" in self._buf:
            i = self._buf.index(b"\n")
            raw = self._buf[:i]
            self._buf = self._buf[i + 1:]
            if raw.endswith(b"\r"):
                raw = raw[:-1]
            self._lines.append(str(raw, "utf-8"))


# A ready-made chat session so beginners can just write ``chat.say(...)``.
chat = ChatBot()

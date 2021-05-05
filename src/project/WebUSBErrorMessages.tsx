const defaultTitle = "WebUSB error";

export const webusbErrorMessages = {
  "update-req": {
    title: "Please update the micro:bit firmware",
    description: (
      <span>
        You need to{" "}
        <a target="_blank" rel="noopener" href="https://microbit.org/firmware/">
          update your micro:bit firmware
        </a>{" "}
        to make use of this feature.
      </span>
    ),
  },
  "clear-connect": {
    title: "Unable to claim interface",
    description: (
      <span>
        Another process is connected to this device.
        <br />
        Close any other tabs that may be using WebUSB (e.g. MakeCode, Python
        Editor), or unplug and replug the micro:bit before trying again.
      </span>
    ),
  },
  "reconnect-microbit": {
    title: defaultTitle,
    description: "Please reconnect your micro:bit and try again.",
  },
  "timeout-error": {
    title: "Connection timed out",
    description: "Unable to connect to the micro:bit",
  },
  unavailable: {
    title: defaultTitle,
    description: (
      <span>
        With WebUSB you can program your micro:bit and connect to the serial
        console directly from the online editor.
        <br />
        Unfortunately, WebUSB is not supported in this browser. We recommend
        Chrome, or a Chrome-based browser to use WebUSB.
      </span>
    ),
  },
};

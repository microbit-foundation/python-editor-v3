import EventEmitter from "events";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFileSystem } from "../fs/fs-hooks";
import { Sensor } from "./model";

export const useSimulator = (ref: React.RefObject<HTMLIFrameElement>) => {
  const fs = useFileSystem();
  const [sensors, setSensors] = useState<Record<string, Sensor>>({});
  const readyCallbacks = useRef([] as Array<() => void>);
  useEffect(() => {
    if (ref.current) {
      const messageListener = (e: MessageEvent) => {
        const simulator = ref.current!.contentWindow;
        if (e.source === simulator) {
          switch (e.data.kind) {
            case "ready": {
              setSensors(
                Object.fromEntries(
                  e.data.sensors.map((json: Sensor) => {
                    return [json.id, json];
                  })
                )
              );
              while (readyCallbacks.current.length) {
                readyCallbacks.current.pop()!();
              }
              break;
            }
            case "serial_output": {
              // TODO
              break;
            }
          }
        }
      };
      window.addEventListener("message", messageListener);
      return () => {
        window.removeEventListener("message", messageListener);
      };
    }
  }, [ref, readyCallbacks]);

  const onSensorChange = useCallback(
    (id: string, value: number) => {
      setSensors((sensors) => ({
        ...sensors,
        [id]: { ...sensors[id], value },
      }));
      const simulator = ref.current!.contentWindow!;
      simulator.postMessage(
        {
          kind: "sensor_set",
          sensor: id,
          value,
        },
        "*"
      );
    },
    [ref, setSensors]
  );

  const play = useCallback(async () => {
    const filesystem: Record<string, Uint8Array> = Object.fromEntries(
      await Promise.all(
        fs.project.files.map(async (f) => [
          f.name,
          (await fs.read(f.name)).data,
        ])
      )
    );
    const simulator = ref.current!.contentWindow!;
    simulator.postMessage(
      {
        kind: "flash",
        filesystem,
      },
      "*"
    );
  }, [ref, fs]);

  const stop = useCallback(async () => {
    const simulator = ref.current!.contentWindow!;
    simulator.postMessage(
      {
        kind: "serial_input",
        // Ctrl-C to interrupt.
        // A specific message would be useful as probably best to clear display etc. here.
        data: `\x03`,
      },
      "*"
    );
  }, [ref]);

  const onSerialOuput = useCallback((data: string) => {
    return data;
  }, []);

  return {
    play,
    stop,
    sensors: Object.values(sensors),
    onSensorChange,
    onSerialOuput,
  };
};

import { usePrevious } from "@chakra-ui/react";
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSimulator } from "../device/device-hooks";
import { RadioDataEvent } from "../device/simulator";

const messageLimit = 100;
let idSeq = 0;

export interface RadioMessage {
  type: "message";
  id: number | string;
  from: "user" | "code";
  message: string;
}

export interface RadioGroupChange {
  type: "groupChange";
  id: number | string;
  group: number;
}

export interface TruncationNotice {
  type: "truncationNotice";
  id: "truncationNotice";
}

export type RadioChatItem = RadioGroupChange | RadioMessage | TruncationNotice;

type UseRadioChatCallbackItemsReturn = [
  RadioChatItem[],
  (message: string) => void
];

const useRadioChatItemsInternal = (
  group: number
): UseRadioChatCallbackItemsReturn => {
  const [items, setItems] = useState<RadioChatItem[]>([]);
  const device = useSimulator();
  const prevGroup = usePrevious(group);
  useEffect(() => {
    if (group !== prevGroup) {
      setItems((items) =>
        cappedMessages([...items, { type: "groupChange", group, id: idSeq++ }])
      );
    }
  }, [group, prevGroup]);

  useEffect(() => {
    const handleReceive = (event: RadioDataEvent) => {
      const message = event.text;
      setItems((items) =>
        cappedMessages([
          ...items,
          { type: "message", from: "code", message, id: idSeq++ },
        ])
      );
    };
    const handleReset = () => {
      setItems([{ type: "groupChange", group, id: idSeq++ }]);
    };
    device.addEventListener("radio_data", handleReceive);
    device.addEventListener("radio_reset", handleReset);
    return () => {
      device.removeEventListener("radio_reset", handleReset);
      device.removeEventListener("radio_data", handleReceive);
    };
  }, [device, group]);
  const handleSend = useCallback(
    (message: string) => {
      setItems((items) =>
        cappedMessages([
          ...items,
          { type: "message", from: "user", message, id: idSeq++ },
        ])
      );
      device.radioSend(message);
    },
    [device]
  );
  return [items, handleSend];
};

// Exposed for testing
export const cappedMessages = (
  items: RadioChatItem[],
  limit: number = messageLimit
): RadioChatItem[] => {
  // Find the first message that we keep.
  let firstKeptMessageIndex = 0;
  let count = 0;
  for (let i = items.length - 1; i >= 0; --i) {
    if (items[i].type === "message") {
      count++;
      firstKeptMessageIndex = i;
      if (count === limit) {
        break;
      }
    }
  }
  const result: RadioChatItem[] = [];
  let truncated: boolean = false;
  items.forEach((item, index) => {
    switch (item.type) {
      case "message": {
        if (index === firstKeptMessageIndex && truncated) {
          result.push({ type: "truncationNotice", id: "truncationNotice" });
        }
        if (index >= firstKeptMessageIndex) {
          result.push(item);
        } else {
          truncated = true;
        }
        break;
      }
      case "truncationNotice": {
        // Skip it, we'll add a new one if required.
        break;
      }
      default: {
        result.push(item);
        break;
      }
    }
  });
  return result;
};

const RadioChatContext = React.createContext<
  UseRadioChatCallbackItemsReturn | undefined
>(undefined);

export const RadioChatProvider = ({
  group,
  children,
}: {
  group: number;
  children: ReactNode;
}) => {
  const items = useRadioChatItemsInternal(group);
  return (
    <RadioChatContext.Provider value={items}>
      {children}
    </RadioChatContext.Provider>
  );
};

export const useRadioChatItems = () => {
  const result = useContext(RadioChatContext);
  if (!result) {
    throw new Error("Missing provider!");
  }
  return result;
};

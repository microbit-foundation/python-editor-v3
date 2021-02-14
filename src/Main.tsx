import React, { useCallback, useEffect, useState } from "react";
import { Text } from "@codemirror/state";
import chuckADuck from "./samples/chuck-a-duck";
import Workbench from "./workbench/Workbench";

const Main = () => {
  const [text, setText] = useState<Text | null>(null);
  useEffect(() => {
    const string = localStorage.getItem("text") || chuckADuck;
    setText(Text.of(string.split("\n")));
  }, []);
  const handleChange = useCallback(
    (text: Text) => {
      setText(text);
      localStorage.setItem("text", text.sliceString(0, undefined, "\n"));
    },
    [setText]
  );
  return text && <Workbench value={text} onDocChanged={handleChange} />;
};

export default Main;

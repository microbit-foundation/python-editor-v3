import React, { useCallback, useEffect, useState } from 'react';
import Editor from './Editor';
import "./App.css";
import { Text } from '@codemirror/state';

const App = () => {
  const [text, setText] = useState<Text | null>(null)
  useEffect(() => {
    const string = localStorage.getItem("text") || "";
    setText(Text.of(string.split("\n")));
  }, []);
  const handleChange = useCallback((text: Text) => {
    setText(text);
    localStorage.setItem("text", text.sliceString(0, undefined, "\n"));
  }, [setText]);
  return (
    text && <Editor className="Editor" value={text} onDocChanged={handleChange} />
  );
}

export default App;

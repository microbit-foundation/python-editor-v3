import React, { useEffect, useState } from 'react';
import Editor from './Editor';
import "./App.css";
import { Text } from '@codemirror/state';

const App = () => {
  const [text, setText] = useState<Text>(Text.empty)
  useEffect(() => {
    const loadData = async () => {
      const response = await fetch("https://raw.githubusercontent.com/python/cpython/master/Lib/fractions.py")
      if (response.status === 200) {
        const text = await response.text();
        setText(Text.of(text.split("\n")));
      }
    }
    loadData();
  }, []);
  return (
    <>
      <Editor className="Editor" value={text} onDocChanged={setText} />
    </>
  );
}

export default App;

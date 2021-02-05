import React, { useState } from 'react';
import Editor from './Editor';
import "./App.css";
import { Text } from '@codemirror/state';

const initialContent = Text.of(`from microbit import *
import radio
radio.config(group=7)
radio.on()

while True:
    radio.send(str(accelerometer.get_y()))
    message = radio.receive()
    if message:
        display.scroll(message)
    sleep(2000)`.split("\n"));

const App = () => {
  const [text, setText] = useState<Text>(initialContent)
  return (
    <>
      <button onClick={() => setText(initialContent)}>Reset</button>
      <Editor className="Editor" value={text} onDocChanged={setText} />
    </>
  );
}

export default App;

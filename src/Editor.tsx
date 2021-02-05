import { useEffect, useRef } from "react";
import {EditorState, EditorView, basicSetup} from "./codemirror"
import {python} from "@codemirror/lang-python"
import "./Editor.css";
import { indentUnit } from "@codemirror/language";

interface EditorProps {
  className?: string;
}

const initialContent = `from microbit import *
import radio
radio.config(group=7)
radio.on()

while True:
    radio.send(str(accelerometer.get_y()))
    message = radio.receive()
    if message:
        display.scroll(message)
    sleep(2000)`;

const Editor = ({className}: EditorProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  useEffect((() => {
    if (!viewRef.current) {
      const state = EditorState.create({
        doc: initialContent,
        extensions: [basicSetup, python(), EditorView.theme({
          $content: {  
            fontSize: "18px"
          }
        })], 
      });
      const view = new EditorView({
        state,
        parent: elementRef.current!,
      });
      viewRef.current = view;
    }
    else {
      // Once we depend on props we can diff and reconfigure here.
    }
    return () => { 
      if (viewRef.current) { 
        viewRef.current.destroy() 
      } 
    };
  }));
  return <div className={className} ref={elementRef} />
}

export default Editor;
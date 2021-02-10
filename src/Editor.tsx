import { useEffect, useRef } from "react";
import { editorConfig } from "./codemirror"
import "./Editor.css";
import { EditorState, StateField } from "@codemirror/state";
import { Text } from "@codemirror/text";
import { EditorView } from "@codemirror/view";

interface EditorProps {
  className?: string;
  value: Text;
  onDocChanged: (doc: Text) => void;
}

const Editor = ({value, className, onDocChanged}: EditorProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  useEffect((() => {
    if (!viewRef.current) {
      // Is there a better way. This feels like an abuse.
      const notify = StateField.define({
        create() { return 0 },
        update(_value, tr) { 
          if (onDocChanged && tr.docChanged) {
            onDocChanged(tr.newDoc)
          }
         }
      });

      const state = EditorState.create({
        doc: value,
        extensions: [notify, editorConfig], 
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
        viewRef.current = null;
      } 
    };
  }), []);

  // Update our value if changed from the outside.
  useEffect(() => {
    // Ignore changes with identical documents as that'd be a loop.
    if (viewRef.current && viewRef.current.state.doc !== value) {
      const view = viewRef.current;
      const state = viewRef.current.state;
      view.dispatch(state.update({
        changes: {from: 0, to: state.doc.length, insert: value}
      }));
    }
  }, [value])

  return (
    <div className={className} ref={elementRef} />
  )
}

export default Editor;
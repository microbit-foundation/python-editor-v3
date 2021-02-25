import { useEffect, useRef } from "react";
import { editorConfig } from "./codemirror";
import { EditorState, StateField } from "@codemirror/state";
import { Text } from "@codemirror/text";
import { EditorView } from "@codemirror/view";

interface EditorProps {
  className?: string;
  initialValue: Text;
  onChange: (doc: Text) => void;
}

const Editor = ({
  initialValue: value,
  className,
  onChange: onDocChanged,
}: EditorProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  useEffect(() => {
    if (!viewRef.current) {
      // Is there a better way. This feels like an abuse.
      const notify = StateField.define({
        create() {
          return 0;
        },
        update(_value, tr) {
          if (onDocChanged && tr.docChanged) {
            onDocChanged(tr.newDoc);
          }
        },
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
    } else {
      // Once we depend on props we can diff and reconfigure here.
      // Maybe like this: https://github.com/sanity-io/sanity/blob/d2af391cbb60f2b6e7bcc195350ae6c85e7f74a8/packages/%40sanity/form-builder/src/hooks/useDidUpdate.ts
    }
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ height: "100%" }} className={className} ref={elementRef} />
  );
};

export default Editor;

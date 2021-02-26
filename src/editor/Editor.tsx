import { useEffect, useRef } from "react";
import {
  editorConfig,
  themeExtensions,
  themeExtensionsTag,
} from "./codemirror";
import { EditorState, tagExtension } from "@codemirror/state";
import { Text } from "@codemirror/text";
import { EditorView } from "@codemirror/view";
import { useDidUpdate } from "../hooks";
import { blocks } from "./blocks";

interface EditorProps {
  className?: string;
  defaultValue: Text;
  onChange: (doc: Text) => void;

  fontSize: number;
  highlightCodeStructure: boolean;
}

/**
 * A React component for CodeMirror 6.
 *
 * Changing style-related props will dispatch events to update CodeMirror.
 *
 * The document itself is uncontrolled. Consider using a key for the editor
 * (e.g. based on the file being edited).
 */
const Editor = ({
  defaultValue,
  className,
  onChange,
  fontSize,
  highlightCodeStructure,
}: EditorProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  useEffect(() => {
    if (!viewRef.current) {
      const notify = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc);
        }
      });
      const state = EditorState.create({
        doc: defaultValue,
        extensions: [
          notify,
          editorConfig,
          // Extensions we enable/disable based on props.
          tagExtension("blocks", blocks()),
          tagExtension(themeExtensionsTag, themeExtensions(fontSize)),
        ],
      });
      const view = new EditorView({
        state,
        parent: elementRef.current!,
      });

      viewRef.current = view;
    }
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  useDidUpdate(fontSize, (previous, current) => {
    if (previous !== undefined && viewRef.current) {
      viewRef.current.dispatch({
        reconfigure: {
          [themeExtensionsTag]: themeExtensions(current),
        },
      });
    }
  });
  useDidUpdate(highlightCodeStructure, (previous, current) => {
    if (previous !== undefined && viewRef.current) {
      viewRef.current.dispatch({
        reconfigure: {
          blocks: current ? blocks() : [],
        },
      });
    }
  });

  return (
    <div style={{ height: "100%" }} className={className} ref={elementRef} />
  );
};

export default Editor;

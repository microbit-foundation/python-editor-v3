import { useEffect, useRef } from "react";
import {
  editorConfig,
  themeExtensions,
  themeExtensionsCompartment,
} from "./config";
import { EditorState } from "@codemirror/state";
import { Text } from "@codemirror/text";
import { EditorView } from "@codemirror/view";
import { useDidUpdate } from "../../common/use-did-update";
import { blocks, blocksCompartment } from "./blocks";
import "./CodeMirror.css";

interface CodeMirrorProps {
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
const CodeMirror = ({
  defaultValue,
  className,
  onChange,
  fontSize,
  highlightCodeStructure,
}: CodeMirrorProps) => {
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
          blocksCompartment.of(highlightCodeStructure ? blocks() : []),
          themeExtensionsCompartment.of(themeExtensions(fontSize)),
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
  }, [defaultValue, fontSize, highlightCodeStructure, onChange]);

  useDidUpdate(fontSize, (previous, current) => {
    if (previous !== undefined && viewRef.current) {
      viewRef.current.state.update({
        effects: themeExtensionsCompartment.reconfigure(
          themeExtensions(fontSize)
        ),
      });
    }
  });
  useDidUpdate(highlightCodeStructure, (previous, current) => {
    if (previous !== undefined && viewRef.current) {
      viewRef.current.state.update({
        effects: blocksCompartment.reconfigure(current ? blocks() : []),
      });
    }
  });

  return (
    <div style={{ height: "100%" }} className={className} ref={elementRef} />
  );
};

export default CodeMirror;

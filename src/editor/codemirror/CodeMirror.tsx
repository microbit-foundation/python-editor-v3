import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { blocks, blocksCompartment } from "./blocks";
import "./CodeMirror.css";
import { editorConfig, themeExtensionsCompartment } from "./config";
import themeExtensions from "./themeExtensions";

interface CodeMirrorProps {
  className?: string;
  defaultValue: string;
  onChange: (doc: string) => void;

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

  // Group the option props together to keep configuration updates simple.
  const options = useMemo(
    () => ({
      fontSize,
      highlightCodeStructure,
    }),
    [fontSize, highlightCodeStructure]
  );

  useEffect(() => {
    const initializing = !viewRef.current;
    if (initializing) {
      const notify = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.sliceDoc(0));
        }
      });
      const state = EditorState.create({
        doc: defaultValue,
        extensions: [
          notify,
          editorConfig,
          // Extensions we enable/disable based on props.
          blocksCompartment.of(options.highlightCodeStructure ? blocks() : []),
          themeExtensionsCompartment.of(themeExtensions(options.fontSize)),
        ],
      });
      const view = new EditorView({
        state,
        parent: elementRef.current!,
      });

      viewRef.current = view;
    }
  }, [options, defaultValue, onChange]);
  useEffect(() => {
    // Do this separately as we don't want to destroy the view whenever options needed for initialization change.
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    viewRef.current!.dispatch({
      effects: [
        themeExtensionsCompartment.reconfigure(
          themeExtensions(options.fontSize)
        ),
        blocksCompartment.reconfigure(
          options.highlightCodeStructure ? blocks() : []
        ),
      ],
    });
  }, [options]);

  return (
    <div style={{ height: "100%" }} className={className} ref={elementRef}/>
  );
};

export default CodeMirror;

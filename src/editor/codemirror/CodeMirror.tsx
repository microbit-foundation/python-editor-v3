/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { highlightActiveLineGutter, lineNumbers } from "@codemirror/gutter";
import { EditorSelection, EditorState, Extension } from "@codemirror/state";
import { EditorView, highlightActiveLine } from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import { createUri } from "../../language-server/client";
import { useLanguageServerClient } from "../../language-server/language-server-hooks";
import { useRouterState } from "../../router-hooks";
import { WorkbenchSelection } from "../../workbench/use-selection";
import { ActiveEditorActions, useActiveEditor } from "../active-editor-hooks";
import "./CodeMirror.css";
import { editorConfig, themeExtensionsCompartment } from "./config";
import { languageServer } from "./language-server/view";
import {
  codeStructure,
  CodeStructureSettings,
  structureHighlightingCompartment,
} from "./structure-highlighting";
import themeExtensions from "./themeExtensions";

interface CodeMirrorProps {
  className?: string;
  defaultValue: string;
  onChange: (doc: string) => void;

  selection: WorkbenchSelection;
  fontSize: number;
  codeStructureSettings: CodeStructureSettings;
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
  selection,
  fontSize,
  codeStructureSettings,
}: CodeMirrorProps) => {
  // Really simple model for now as we only have one editor at a time.
  const [, setActiveEditor] = useActiveEditor();
  const uri = createUri(selection.file);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const client = useLanguageServerClient();
  const intl = useIntl();

  // Group the option props together to keep configuration updates simple.
  const options = useMemo(
    () => ({
      fontSize,
      codeStructureSettings,
    }),
    [fontSize, codeStructureSettings]
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
          // Extensions only relevant for editing:
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          client ? languageServer(client, uri, intl) : [],
          // Extensions we enable/disable based on props.
          structureHighlightingCompartment.of(
            codeStructure(options.codeStructureSettings)
          ),
          themeExtensionsCompartment.of(themeExtensionsForOptions(options)),
        ],
      });
      const view = new EditorView({
        state,
        parent: elementRef.current!,
      });

      viewRef.current = view;
      setActiveEditor(new ActiveEditorActions(view));
    }
  }, [options, defaultValue, onChange, client, setActiveEditor, uri, intl]);
  useEffect(() => {
    // Do this separately as we don't want to destroy the view whenever options needed for initialization change.
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
        setActiveEditor(undefined);
      }
    };
  }, [setActiveEditor]);

  useEffect(() => {
    viewRef.current!.dispatch({
      effects: [
        themeExtensionsCompartment.reconfigure(
          themeExtensionsForOptions(options)
        ),
        structureHighlightingCompartment.reconfigure(
          codeStructure(options.codeStructureSettings)
        ),
      ],
    });
  }, [options]);

  const { location } = selection;
  useEffect(() => {
    // When the identity of location changes then the user has navigated.
    if (location.line) {
      const view = viewRef.current!;
      let line;
      try {
        line = view.state.doc.line(location.line);
      } catch (e) {
        // Document doesn't have that line, e.g. link from stale error
        // after a code edit.
        return;
      }
      view.dispatch({
        scrollIntoView: true,
        selection: EditorSelection.single(line.from),
      });
      view.focus();
    }
  }, [location]);

  const [routerState, setRouterState] = useRouterState();
  useEffect(() => {
    const listener = (event: Event) => {
      const id = (event as CustomEvent).detail.id;
      setRouterState({
        ...routerState,
        tab: "reference",
        reference: { id },
      });
      const view = viewRef.current!;
      // Put the focus back in the text editor so the docs are immediately useful.
      view.focus();
    };
    document.addEventListener("cm/openDocs", listener);
    return () => {
      document.removeEventListener("cm/openDocs", listener);
    };
  }, [routerState, setRouterState]);

  return (
    <section
      data-testid="editor"
      aria-label={intl.formatMessage({ id: "code-editor" })}
      style={{ height: "100%" }}
      className={className}
      ref={elementRef}
    />
  );
};

function themeExtensionsForOptions(options: { fontSize: number }): Extension {
  return themeExtensions(options.fontSize + "pt");
}

export default CodeMirror;

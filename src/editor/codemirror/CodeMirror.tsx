/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { redoDepth, undoDepth } from "@codemirror/commands";
import { EditorSelection, EditorState, Extension } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
  ViewUpdate,
} from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { useIntl } from "react-intl";
import { lineNumFromUint8Array } from "../../common/text-util";
import useActionFeedback from "../../common/use-action-feedback";
import { useDocumentation } from "../../documentation/documentation-hooks";
import { createUri } from "../../language-server/client";
import { useLanguageServerClient } from "../../language-server/language-server-hooks";
import { Logging } from "../../logging/logging";
import { useLogging } from "../../logging/logging-hooks";
import { useRouterState } from "../../router-hooks";
import { useSessionSettings } from "../../settings/session-settings";
import {
  CodeStructureOption,
  ParameterHelpOption,
} from "../../settings/settings";
import { WorkbenchSelection } from "../../workbench/use-selection";
import {
  EditorActions,
  useActiveEditorActionsState,
  useActiveEditorInfoState,
} from "../active-editor-hooks";
import "./CodeMirror.css";
import { compartment, editorConfig } from "./config";
import { dndSupport } from "./dnd";
import { languageServer } from "./language-server/view";
import { lintGutter } from "./lint/lint";
import { codeStructure } from "./structure-highlighting";
import themeExtensions from "./themeExtensions";
import { useDevice } from "../../device/device-hooks";

interface CodeMirrorProps {
  className?: string;
  defaultValue: string;
  onChange: (doc: string) => void;

  selection: WorkbenchSelection;
  fontSize: number;
  codeStructureOption: CodeStructureOption;
  parameterHelpOption: ParameterHelpOption;
  warnOnV2OnlyFeatures: boolean;
  disableV2OnlyFeaturesWarning: () => void;
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
  codeStructureOption,
  parameterHelpOption,
  warnOnV2OnlyFeatures,
  disableV2OnlyFeaturesWarning,
}: CodeMirrorProps) => {
  // Really simple model for now as we only have one editor at a time.
  const [, setActiveEditor] = useActiveEditorActionsState();
  const uri = createUri(selection.file);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const client = useLanguageServerClient();
  const intl = useIntl();
  const [, setEditorInfo] = useActiveEditorInfoState();
  const logging = useLogging();
  const actionFeedback = useActionFeedback();
  const [sessionSettings, setSessionSettings] = useSessionSettings();
  const { apiReferenceMap } = useDocumentation();
  const device = useDevice();

  // Reset undo/redo events on file change.
  useEffect(() => {
    setEditorInfo({
      undo: 0,
      redo: 0,
    });
  }, [setEditorInfo]);

  // Group the option props together to keep configuration updates simple.
  const options = useMemo(
    () => ({
      fontSize,
      codeStructureOption,
      parameterHelpOption,
      warnOnV2OnlyFeatures,
    }),
    [fontSize, codeStructureOption, parameterHelpOption, warnOnV2OnlyFeatures]
  );

  useEffect(() => {
    const initializing = !viewRef.current;
    if (initializing) {
      const notify = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.sliceDoc(0));
          setEditorInfo({
            undo: undoDepth(view.state),
            redo: redoDepth(view.state),
          });
          logPastedLineCount(logging, update);
        }
      });
      const state = EditorState.create({
        doc: defaultValue,
        extensions: [
          notify,
          editorConfig,
          // Extension requires external state.
          dndSupport({ sessionSettings, setSessionSettings }),
          // Extensions only relevant for editing:
          // Order of lintGutter and lineNumbers determines how they are displayed.
          lintGutter({ hoverTime: 0 }),
          lineNumbers(),
          highlightActiveLineGutter(),
          highlightActiveLine(),
          // Extensions we enable/disable based on props.
          compartment.of([
            client
              ? languageServer(
                  client,
                  device,
                  uri,
                  intl,
                  logging,
                  apiReferenceMap.status === "ok"
                    ? apiReferenceMap.content
                    : {},
                  {
                    signatureHelp: {
                      automatic: parameterHelpOption === "automatic",
                    },
                    warnOnV2OnlyFeatures: options.warnOnV2OnlyFeatures,
                  },
                  {
                    disableV2OnlyFeaturesWarning,
                  }
                )
              : [],
            codeStructure(options.codeStructureOption),
            themeExtensionsForOptions(options),
          ]),
        ],
      });
      const view = new EditorView({
        state,
        parent: elementRef.current!,
      });

      viewRef.current = view;
      setActiveEditor(new EditorActions(view, logging, actionFeedback, intl));
    }
  }, [
    actionFeedback,
    client,
    defaultValue,
    intl,
    logging,
    onChange,
    options,
    setActiveEditor,
    setEditorInfo,
    sessionSettings,
    setSessionSettings,
    parameterHelpOption,
    uri,
    apiReferenceMap,
    device,
    disableV2OnlyFeaturesWarning,
  ]);
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
        compartment.reconfigure([
          client
            ? languageServer(
                client,
                device,
                uri,
                intl,
                logging,
                apiReferenceMap.status === "ok" ? apiReferenceMap.content : {},
                {
                  signatureHelp: {
                    automatic: parameterHelpOption === "automatic",
                  },
                  warnOnV2OnlyFeatures: options.warnOnV2OnlyFeatures,
                },
                {
                  disableV2OnlyFeaturesWarning,
                }
              )
            : [],
          codeStructure(options.codeStructureOption),
          themeExtensionsForOptions(options),
        ]),
      ],
    });
  }, [
    options,
    parameterHelpOption,
    client,
    intl,
    logging,
    uri,
    apiReferenceMap,
    device,
    disableV2OnlyFeaturesWarning,
  ]);

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
      const { id, tab } = (event as CustomEvent).detail;
      setRouterState(
        {
          tab,
          slug: { id },
        },
        "documentation-from-code"
      );
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

const logPastedLineCount = (logging: Logging, update: ViewUpdate) => {
  update.transactions
    .filter((transaction) => transaction.isUserEvent("input.paste"))
    .forEach((transaction) =>
      transaction.changes.iterChanges(
        (_fromA, _toA, _fromB, _toB, inserted) => {
          const lineCount = lineNumFromUint8Array(
            // Ignore leading/trailing lines.
            new TextEncoder().encode(inserted.toString().trim())
          );
          logging.event({
            type: "paste",
            value: lineCount,
          });
        }
      )
    );
};

export default CodeMirror;

import { EditorState, Extension, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { PortalFactory } from "../CodeMirror";
import React from "react";
import { createWidget } from "./widgetArgParser";
import { openWidgetEffect } from "./openWidgets";
import { ValidateComponentArgs } from "./widgetArgParser";

export interface WidgetProps {
  // Note: always an array, can be singleton
  args: any[];
  // Ranges of where to insert each argument
  ranges: { from: number; to: number }[];
  // Type of each argument, can be checked in widget to determine if it is editable
  types: string[];
  // Where to insert the changed values
  from: number;
  to: number;
}

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class Widget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(
    private component: React.ComponentType<any>,
    private props: WidgetProps,
    private open: React.ComponentType<any>,
    private inline: boolean,
    private createPortal: PortalFactory
  ) {
    super();
  }

  eq(other: WidgetType): boolean {
    const them = other as Widget;
    let args1 = this.props.args;
    let args2 = them.props.args;
    let eqArgs =
      args1.length === args2.length &&
      args1.every((element, index) => element === args2[index]);

    return (
      them.component === this.component &&
      them.props.to === this.props.to &&
      eqArgs &&
      them.inline === this.inline
    );
  }

  updateDOM(dom: HTMLElement, view: EditorView): boolean {
    dom.style.display = this.inline ? "inline-block" : "unset";
    this.portalCleanup = this.createPortal(dom, this.toComponent(view));
    return true;
  }

  private toComponent(view: EditorView) {
    if (this.inline) {
      return <this.open loc={this.props.to} view={view} />;
    }
    return <this.component props={this.props} view={view} />;
  }

  toDOM(view: EditorView) {
    const dom = document.createElement("div");

    if (
      this.inline &&
      !ValidateComponentArgs(this.component, this.props.args, this.props.types)
    ) {
      return dom;
    }
    dom.style.display = this.inline ? "inline-block" : "unset";
    this.portalCleanup = this.createPortal(dom, this.toComponent(view));
    return dom;
  }

  destroy(dom: HTMLElement): void {
    if (this.portalCleanup) {
      this.portalCleanup();
    }
  }

  ignoreEvent() {
    return true;
  }
}

// Iterates through the syntax tree, finding occurences of SoundEffect ArgList, and places widget there
export const reactWidgetExtension = (
  createPortal: PortalFactory
): Extension => {
  const decorate = (state: EditorState) => {
    let widgets: any[] = [];

    syntaxTree(state).iterate({
      enter: (ref) => {
        // Found an ArgList, parent will be a CallExpression
        if (ref.name === "ArgList" && ref.node.parent) {
          // Match CallExpression name to our widgets
          let name = state.doc.sliceString(ref.node.parent.from, ref.from);
          let widget = createWidget(name, state, ref.node);
          if (widget) {
            let deco = Decoration.widget({
              widget: new Widget(
                widget.comp,
                widget.props,
                widget.open,
                widget.props.to !== openWidgetLoc,
                createPortal
              ),
              side: 1,
            });
            widgets.push(deco.range(ref.to));
          }
        }
      },
    });

    return Decoration.set(widgets);
  };

  let openWidgetLoc = -1;
  const stateField = StateField.define<DecorationSet>({
    create(state) {
      return decorate(state);
    },
    update(widgets, transaction) {
      // check for open/close button pressed
      for (let effect of transaction.effects) {
        if (effect.is(openWidgetEffect)) {
          openWidgetLoc = effect.value;
          return decorate(transaction.state);
        }
      }
      // else check for other doc edits
      if (transaction.docChanged) {
        // update openWidgetLoc if changes moves it
        openWidgetLoc = transaction.changes.mapPos(openWidgetLoc);
        return decorate(transaction.state);
      }
      return widgets.map(transaction.changes);
    },
    provide(field) {
      return EditorView.decorations.from(field);
    },
  });
  return [stateField];
};

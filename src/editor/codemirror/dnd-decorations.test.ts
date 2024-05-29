/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChangeSet, EditorState, Text, Transaction } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { DndDecorationsViewPlugin } from "./dnd-decorations";
import { MockedFunction, vi } from "vitest";

describe("dndDecorations", () => {
  it("null case", () => {
    const view = createView();
    const plugin = new DndDecorationsViewPlugin(view, 0);

    expect(plugin.decorations.size).toEqual(0);

    plugin.update(createViewUpdate(view, false, undefined));

    expect(plugin.decorations.size).toEqual(0);
    expect(decorationDetails(plugin)).toEqual([]);
  });

  it("handles drag", () => {
    const view = createView();
    const plugin = new DndDecorationsViewPlugin(view, 0);

    plugin.update(
      createViewUpdate(
        view,
        true,
        view.state.update({
          userEvent: "dnd.preview",
          changes: [
            {
              insert: "a line\n",
              from: 0,
            },
          ],
        })
      )
    );

    expect(plugin.decorations.size).toEqual(1);
    expect(decorationDetails(plugin)).toEqual([
      {
        class: "cm-preview",
        from: 0,
      },
    ]);
  });

  it("handles drop", async () => {
    let view = createView();
    const plugin = new DndDecorationsViewPlugin(view, 0);

    const update = createViewUpdate(
      view,
      true,
      view.state.update({
        userEvent: "dnd.drop",
        changes: [
          {
            insert: "a line\n",
            from: 0,
          },
        ],
      })
    );
    plugin.update(update);
    view = update.view;

    expect(plugin.decorations.size).toEqual(1);
    expect(decorationDetails(plugin)).toEqual([
      {
        class: "cm-dropped--recent",
        from: 0,
      },
    ]);

    // ...and later dispatches timeout effect
    // (we've reduced the delay to 0 but it's still async)
    const mockDispatch = view.dispatch as unknown as MockedFunction<
      (t: Transaction) => void
    >;
    expect(mockDispatch.mock.calls.length).toEqual(0);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockDispatch.mock.calls.length).toEqual(1);

    // when the timeout actually happens we change the class
    const timeoutTransaction = mockDispatch.mock.calls[0][0];
    plugin.update(createViewUpdate(update.view, false, timeoutTransaction));

    expect(decorationDetails(plugin)).toEqual([
      {
        class: "cm-dropped--done",
        from: 0,
      },
    ]);
  });

  it("clears decorations for other edits", () => {
    let view = createView();
    const plugin = new DndDecorationsViewPlugin(view, 0);

    const update = createViewUpdate(
      view,
      true,
      view.state.update({
        userEvent: "dnd.drop",
        changes: [
          {
            insert: "a line\n",
            from: 0,
          },
        ],
      })
    );
    plugin.update(update);
    view = update.view;

    plugin.update(
      createViewUpdate(
        view,
        true,
        view.state.update({
          // No userEvent set.
          changes: [{ insert: "anything", from: 0 }],
        })
      )
    );

    expect(plugin.decorations.size).toEqual(0);
  });

  it("handles inserting at end of doc with no blank line", () => {
    const view = createView(Text.of(["#1"]));
    const plugin = new DndDecorationsViewPlugin(view, 0);

    const viewUpdate = createViewUpdate(
      view,
      true,
      view.state.update({
        userEvent: "dnd.preview",
        changes: [
          {
            insert: "\n#2\n",
            from: 2,
          },
        ],
      })
    );
    plugin.update(viewUpdate);
    expect(viewUpdate.state.doc.sliceString(0)).toEqual("#1\n#2\n");

    expect(decorationDetails(plugin)).toEqual([
      {
        class: "cm-preview",
        from: 3,
      },
    ]);
  });
});

interface DecorationDetails {
  from: number;
  class: string;
}

const decorationDetails = (plugin: DndDecorationsViewPlugin) => {
  const result: DecorationDetails[] = [];
  for (
    const iter = plugin.decorations.iter(0);
    iter.value !== null;
    iter.next()
  ) {
    result.push({
      class: iter.value.spec.attributes.class,
      from: iter.from,
    });
  }
  return result;
};

const createView = (doc: Text = Text.of([""])): EditorView => {
  const view: Partial<EditorView> = {
    visibleRanges: [{ from: 0, to: doc.length - 1 }],
    state: EditorState.create({ doc }),
    dispatch: vi.fn() as any,
  };
  return view as unknown as EditorView;
};

/**
 * Note that, unlike normal CodeMirror usage, you must use the update's
 * view for any subsequent changes.
 */
const createViewUpdate = (
  view: EditorView,
  docChanged: boolean,
  transaction: Transaction | undefined
): ViewUpdate => {
  const state = transaction ? transaction.state || view.state : view.state;
  return {
    view: createView(state.doc),
    state,
    transactions: transaction ? [transaction] : [],
    changes: transaction ? transaction.changes : ChangeSet.empty(0),
    docChanged,
  } as Partial<ViewUpdate> as unknown as any;
};

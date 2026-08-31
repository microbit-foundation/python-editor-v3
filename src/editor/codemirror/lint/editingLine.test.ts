/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChangeSet, EditorState, StateEffect } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { MockedFunction, vi } from "vitest";
import {
  EditingLineViewPlugin,
  editingLineState,
  setEditingLineEffect,
} from "./editingLine";

describe("editingLineState", () => {
  const createState = () =>
    EditorState.create({
      doc: "print('a')\nprint('b')",
      extensions: [editingLineState],
    });

  it("starts unset", () => {
    expect(createState().field(editingLineState)).toBeUndefined();
  });

  it("tracks the effect", () => {
    let state = createState();
    state = state.update({ effects: [setEditingLineEffect.of(2)] }).state;
    expect(state.field(editingLineState)).toEqual(2);

    // Unrelated transactions leave it alone.
    state = state.update({ changes: { from: 0, insert: "x" } }).state;
    expect(state.field(editingLineState)).toEqual(2);

    state = state.update({
      effects: [setEditingLineEffect.of(undefined)],
    }).state;
    expect(state.field(editingLineState)).toBeUndefined();
  });
});

describe("EditingLineViewPlugin", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const createUpdate = (
    state: EditorState,
    changes: ChangeSet,
    { docChanged, selectionSet }: { docChanged: boolean; selectionSet: boolean }
  ): ViewUpdate => {
    const dispatch = vi.fn();
    const update = {
      state,
      changes,
      docChanged,
      selectionSet,
      view: { dispatch } as unknown as ViewUpdate["view"],
    } as Partial<ViewUpdate> as unknown as ViewUpdate;
    return update;
  };

  const dispatchMock = (update: ViewUpdate) =>
    update.view.dispatch as unknown as MockedFunction<
      (spec: { effects: StateEffect<unknown>[] }) => void
    >;

  const editingLineEffectValues = (update: ViewUpdate) =>
    dispatchMock(update).mock.calls.map(([spec]) => {
      expect(spec.effects).toHaveLength(1);
      expect(spec.effects[0].is(setEditingLineEffect)).toEqual(true);
      return spec.effects[0].value;
    });

  const flushMicrotasks = () => new Promise<void>((r) => queueMicrotask(r));

  const createState = (extraLines: number = 0) =>
    EditorState.create({
      doc: "print('a')\nprint('b')" + "\npass".repeat(extraLines),
      extensions: [editingLineState],
    });

  it("marks the line as edited when a change happens at the cursor's line", async () => {
    const base = createState();
    const tr = base.update({
      changes: { from: base.doc.length, insert: "x" },
      selection: { anchor: base.doc.length + 1 },
    });
    const plugin = new EditingLineViewPlugin();
    const update = createUpdate(tr.state, tr.changes, {
      docChanged: true,
      selectionSet: true,
    });
    plugin.update(update);
    await flushMicrotasks();
    expect(editingLineEffectValues(update)).toEqual([2]);
  });

  it("clears after the editing timeout", async () => {
    const base = createState();
    const tr = base.update({
      changes: { from: base.doc.length, insert: "x" },
      selection: { anchor: base.doc.length + 1 },
    });
    const plugin = new EditingLineViewPlugin();
    const update = createUpdate(tr.state, tr.changes, {
      docChanged: true,
      selectionSet: true,
    });
    plugin.update(update);
    await flushMicrotasks();
    vi.advanceTimersByTime(5_000);
    expect(editingLineEffectValues(update)).toEqual([2, undefined]);
  });

  it("clears when the selection moves to another line", async () => {
    let state = createState();
    state = state.update({ effects: [setEditingLineEffect.of(2)] }).state;
    state = state.update({ selection: { anchor: 3 } }).state;
    const plugin = new EditingLineViewPlugin();
    const update = createUpdate(state, ChangeSet.empty(state.doc.length), {
      docChanged: false,
      selectionSet: true,
    });
    plugin.update(update);
    await flushMicrotasks();
    expect(editingLineEffectValues(update)).toEqual([undefined]);
  });

  it("does nothing when the cursor stays on the tracked line", async () => {
    let state = createState();
    state = state.update({ effects: [setEditingLineEffect.of(1)] }).state;
    state = state.update({ selection: { anchor: 3 } }).state;
    const plugin = new EditingLineViewPlugin();
    const update = createUpdate(state, ChangeSet.empty(state.doc.length), {
      docChanged: false,
      selectionSet: true,
    });
    plugin.update(update);
    await flushMicrotasks();
    expect(dispatchMock(update)).not.toHaveBeenCalled();
  });

  it("ignores updates without document or selection changes", async () => {
    const state = createState();
    const plugin = new EditingLineViewPlugin();
    const update = createUpdate(state, ChangeSet.empty(state.doc.length), {
      docChanged: false,
      selectionSet: false,
    });
    plugin.update(update);
    await flushMicrotasks();
    expect(dispatchMock(update)).not.toHaveBeenCalled();
  });

  it("does not mark edits away from the cursor's line", async () => {
    const base = createState(2);
    // Edit line 1 while the cursor is on line 4.
    const tr = base.update({
      changes: { from: 0, insert: "x" },
      selection: { anchor: base.doc.length + 1 },
    });
    const plugin = new EditingLineViewPlugin();
    const update = createUpdate(tr.state, tr.changes, {
      docChanged: true,
      selectionSet: true,
    });
    plugin.update(update);
    await flushMicrotasks();
    expect(editingLineEffectValues(update)).toEqual([undefined]);
  });
});

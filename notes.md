# Notes

## UX issues

### Gutter

Is it weird that the gutter changes width? I think it's fair enough when adding room for another digit, but I think when folding is enabled it should reserve space for itself.

### Last line

Last line behaves weirdly - perhaps because of missing newline or lack of special casing? 
1. Auto-indent doesn't work for last line of the document.
2. Copying that line to insert earlier in the document also doesn't have newline.

## Bugs

Deleting the end of a docstring causes the syntax highlighter to crash:

CodeMirror plugin crashed: Error: Ranges must be added sorted by `from` position and `startSide`
    at RangeSetBuilder.addInner (index.js:332)
    at RangeSetBuilder.add (index.js:326)
    at index.js:310
    at leave (index.js:370)
    at Tree.iterate (tree.ts:326)
    at highlightTreeRange (index.js:325)
    at TreeHighlighter.buildDeco (index.js:309)
    at TreeHighlighter.update (index.js:301)
    at PluginInstance.update (index.js:1657)
    at EditorView.updatePlugins (index.js:5047)
    at EditorView.update (index.js:4980)
    at EditorView._dispatch (index.js:4912)
    at EditorView.dispatch (index.js:4955)
    at deleteBy (index.js:273)
    at deleteByChar (index.js:276)
    at deleteCodePointBackward (index.js:302)
    at runFor (index.js:5674)
    at runHandlers (index.js:5684)
    at Object.keydown (index.js:5590)
    at InputState.runCustomHandlers (index.js:2848)
    at HTMLDivElement.<anonymous> (index.js:2809)

    Double space bar inserts a dot. Weird feature or bug? It's in CodeMirror 5 too.

## Mobile

iOS:
   - Seems to work pretty well.

Pretty broken on Android:
    - Numbers sometimes repeat
    - Backspace results in unexpected cursor movements
    - ... ?

## Structural highlighting

```
def __setitem__(self, key, value,
                dict_setitem=dict.__setitem__, proxy=_proxy, Link=_Link):
    pass
```

Need to consider multi-line function signatures as we only highlight the first line correctly.

Would be nice if line below was considered part of the thingy if you've just inserted it. Might be weird in practice though.

Comments below a block get included - we need to skip them when working backwards to find the true end of a block (we already do this for whitespace).

Bug with some classes where the member functions can all end up as children of __init__ for no obvious reason after an edit.
Can be seen with StreamWriter from https://raw.githubusercontent.com/python/cpython/master/Lib/codecs.py.
It's a bug in the parse, the same effect can be seen in the folding implementation with our code disabled.

Don't draw boxes around folded code.

Align fold points and boxes? Main difference is folding allows folding of if/else branches not the block as a whole.

Boxes around all statements?

Scrap the boxes, keep the highlighting, draw an upsidedown L shape showing the block indent.

## Widgets

Not had a chance to play yet.

Consider replacing docstrings with a widget?

Images widget.
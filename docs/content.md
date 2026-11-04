# Documentation content

The documentation tabs in the sidebar and everything in them are read from the
`content/` folder. Content is written in Markdown and bundled with the app at
build time. To change it, edit the files and redeploy.

```
content/
  sidebar.json            # which tabs exist, in which order
  mapping.json            # optional: API entries → documentation (editor "Help" links)
  images/                 # images, referenced relatively from Markdown
  de/                     # one folder per language
    text/                 # one folder per section (the section id)
      text.md             # reference layout: one file per topic
    projekte/
      wetterstation.md    # cards layout: one file per card
  en/
    text/
      text.md             # translations use the same file names
```

## Sidebar (`content/sidebar.json`)

```json
{
  "fallbackLanguage": "de",
  "sections": [
    {
      "id": "text",
      "layout": "reference",
      "icon": "RiText",
      "accentColor": "#5ba68d",
      "title": "Text",
      "description": { "de": "…", "en": "…" },
      "order": ["text"]
    },
    {
      "id": "projekte",
      "layout": "cards",
      "icon": "RiLightbulbFlashLine",
      "title": "Projekte"
    }
  ]
}
```

- Each entry in `sections` is a tab, in this order. The **Project** (files) tab
  always comes last.
- **`id`** is the folder name and appears in URLs (`/text/text`). Use
  lowercase letters, digits and `-`. `api` and `project` are reserved.
- **`layout`**:
  - `reference`: a list of topics. Each topic has entries with code you can
    drag into the editor.
  - `cards`: a grid of cards. Each card opens a page whose code can be opened
    as a project.
- **`icon`**: one of the names in `src/documentation/sections/icons.ts`. To
  use another [react-icons](https://react-icons.github.io/react-icons/) icon,
  add it there.
- **`accentColor`**: optional six-digit hex colour shown behind the sidebar
  icon. Use it when a section mirrors the colour of an external block category.
- **`direct`** (optional): when `true` and the section contains exactly one
  reference topic, show that topic's blocks immediately without an intermediate
  topic list.
- **`title`** / **`description`**: a string, or an object with a value per
  language.
- **`order`** (optional): file names without `.md`. Files that aren't listed
  come after the listed ones, in alphabetical order.

### Languages

For each file, the editor uses the version in the user's language
(`content/<lang>/…`). If there isn't one, it tries the base language (e.g.
`pt` for `pt-BR`), then `fallbackLanguage`. Partial translations are fine.

## Reference topics

One Markdown file per topic:

````markdown
---
name: Schleifen
subtitle: Code wiederholen
image: ../../images/schleifen.svg
---

Introduction shown at the top of the topic.

## Endlosschleife

<!-- @slug endlos -->

Text shown before the code. When an entry has code, this text collapses to
one line until the user clicks "More".

```python
while True:
    pass
```

<!-- @details -->

Only shown after clicking "More".

## Zählschleife

<!-- @alternatives Anzahl -->

### 3 Mal

```python
for i in range(3): print(i)
```

### 10 Mal

```python
for i in range(10): print(i)
```
````

- **Front matter**:
  - `name`: defaults to the file name.
  - `slug`: defaults to the file name.
  - `subtitle`
  - `image`: the topic icon.
- Everything before the first `##` is the **introduction**.
- Each **`##` heading starts an entry**. The entry's slug is the heading,
  lower-cased and with umlauts replaced, e.g. `zaehlschleife`.
- **Directives** are HTML comments placed after an entry heading:
  - `<!-- @slug name -->` sets the entry's slug. Placed after a `###`
    alternative heading, it sets that alternative's slug instead.
  - `<!-- @alternatives Label -->`: the `###` headings that follow become
    choices in a dropdown labelled "Label".
  - `<!-- @details -->`: the content that follows is shown only when expanded.
  - Several directives can share one comment:
    `<!-- @slug a @alternatives Auswahl -->`.
- Slugs must be unique within a section. A duplicate entry slug is
  automatically prefixed with the topic slug.

## Combining sensor blocks

Dragging a block from the `sensoren` section into the editor, or copying it with
the editor's **Copy code** action and pasting it there, combines its setup with
the current file. Ordinary clipboard text and blocks from other sections retain
their existing insertion behavior.

- Recognized initialization is placed at module level before the main loop.
- Identical buses, power-pin objects and sensor constructors are reused, including
  objects with different variable names. Comparisons use Python syntax and imported
  names, not a text search. Different pins, addresses or bus configurations are
  kept separate, with a fresh variable name when necessary.
- Measurement blocks can use an existing sensor under another name when exactly
  one matching sensor constructor is found. Multiple matching sensors require
  the author to choose the object explicitly.
- Only unconditional setup before the first compound statement is reused. Local,
  conditional, reassigned and deinitialized objects are not assumed reusable.
  Incomplete Python and snippets with locally rebound setup names retain ordinary
  insertion behavior. Existing project text is never rewritten by the combination.
- An undefined sensor object reported by the language server gets a localized
  initialization hint and an action opening the corresponding documentation block.
  These hints do not check whether physical hardware is connected.

The supported constructor names, default object names and initialization links are
listed in `src/editor/codemirror/sensor-snippets.ts`. Update that list when adding
a sensor, and keep its block title/slug in sync with the content. The shipped
initialization blocks are exercised in pairwise combination tests. Generic Python
dependency analysis and arbitrary custom initialization routines are outside this
feature.

## Cards

One Markdown file per card:

```markdown
---
name: Wetterstation
image: ../../images/wetterstation.svg
---

Page content, including `###` headings, images and code.
```

## Markdown support

| Markdown                             | Result                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `**bold**`, `*italic*`, `` `code` `` | Inline formatting                                                                                     |
| Lists (`-`, `1.`), `> quote`, `###`  | Lists, quotes, headings                                                                               |
| ` ```python ` (or no language)       | Code snippet: drag/copy (reference), open (cards)                                                     |
| ` ```text ` (any other language)     | Plain code text                                                                                       |
| `![alt](../../images/x.png)`         | Image (path relative to the `.md` file, or `/images/x.png` for `content/images/x.png`, or a full URL) |
| `[text](https://…)`                  | External link (opens a new tab)                                                                       |
| `[text](doc:section/slug)`           | Link to a topic, entry or card in a section                                                           |
| `[text](doc:slug)`                   | Same, searching all sections for the slug                                                             |

Inline HTML and tables aren't supported.

## Help links from the editor (`content/mapping.json`)

The editor's autocomplete and signature help show a "Help" link when a Python
entry is mapped to documentation:

```json
{
  "time": {
    "sleep": "zeit/warten",
    "monotonic": { "reference": "zeit/laufzeit", "alternative": "ms" }
  }
}
```

The target is `section/slug`. The `alternative` field preselects a choice in an
entry that has `@alternatives`.

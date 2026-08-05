# Quick Reference

Command-line quick reference sheets, plus a small static site that renders them
in a browser. No server, no build step, no dependencies.

## The sheets

| Sheet | Covers |
|---|---|
| [bash.md](bash.md) | Shell navigation, expansion, redirection, job control |
| [git.md](git.md) | Branching, history surgery, rebases, recovery |
| [powershell.md](powershell.md) | Cmdlets, objects, the pipeline, remoting |
| [python.md](python.md) | Idioms, stdlib highlights, tooling |
| [ruby.md](ruby.md) | Blocks, enumerables, stdlib patterns |
| [tmux.md](tmux.md) | Sessions, windows, panes, key bindings |

Each is readable as plain Markdown on its own — the site is additive.

## Viewing

Open [index.html](index.html) by double-clicking it. That's all.

It works straight off the filesystem over `file://` because nothing is fetched:
each page carries its own Markdown inline, and `<link>` / `<script src>` are not
subject to the cross-origin rules that block `fetch()` on local files.

The same files also serve over HTTP unchanged — see [Publishing](#publishing).

## Layout

```
index.html       overview, links to each sheet
<sheet>.html     one page per sheet, with that sheet's Markdown inlined
qr.js            the renderer — shared by all 7 pages
qr.css           all styling — shared by all 7 pages
<sheet>.md       the sheets as standalone Markdown (the editable source)
```

Every page is the same three lines of substance:

```html
<link rel="stylesheet" href="qr.css">
<script id="md" type="text/markdown">...the sheet's Markdown...</script>
<script src="qr.js"></script>
```

`qr.js` reads that block, renders it into `<main>`, builds the shared nav
(marking the current page), and jumps to `#anchor` if the URL has one.
Navigation between sheets is ordinary links — real pages, not hash routing.

### The renderer

`qr.js` is a hand-rolled line-based Markdown renderer, about 100 lines. It
handles what these sheets use: headings (with slugged `id`s for deep links),
GFM tables including `\|` escapes, fenced code blocks, inline code, bold,
links, lists, and horizontal rules. It does not handle nested lists,
blockquotes, images, or setext headings.

All text is HTML-escaped. Code spans are extracted before escaping so `**` and
`[]` inside them stay literal, using the private-use codepoints U+E000 and
U+E001 as placeholders. Keep those written as `\uE000` / `\uE001` escapes in
the source, never as literal characters — some editors and tools silently drop
private-use codepoints, which would turn the substitution into a no-op.

Styling is CSS custom properties in `qr.css`, with a `prefers-color-scheme`
dark variant and a 700px breakpoint that stacks the nav above the content.

## Editing a sheet

The Markdown lives in two places: `<sheet>.md` and the `<script id="md">` block
inside `<sheet>.html`. Edit the `.md`, then paste it into that block to update
the page. There is no build step to do it for you — that's the cost of having
the pages work over `file://`.

Two constraints on sheet content, because it sits inside a `<script>` block:
it must not contain `</script`, `<script`, or `<!--`. Any of those would end
the block early. Everything else, including HTML-looking text, is safe.

## Adding a sheet

1. Write `foo.md`.
2. Copy an existing page to `foo.html`, replace the `<title>` and the contents
   of the `<script id="md">` block.
3. Add `'foo'` to the `SHEETS` array at the top of [qr.js](qr.js) — that puts it
   in the nav on every page.
4. Add a line to the list in the `<script id="md">` block of
   [index.html](index.html) so the overview links to it.

Use `#`–`####` headings; they become linkable anchors automatically.

## Publishing

The repo root is the site. Publish it as-is to any static host — no
configuration, no base path, no rewrite rules. All references are relative, so
it works at a domain root or in a subdirectory equally.

This repo deploys to GitHub Pages via
[.github/workflows/static.yml](.github/workflows/static.yml) on every push to
`main`. Enable it once under **Settings → Pages → Build and deployment →
Source: GitHub Actions**.

Live at: **https://bulmaro.github.io/qr/**

Individual sheets are at `https://bulmaro.github.io/qr/<sheet>.html`, and
headings are linkable — e.g.
`https://bulmaro.github.io/qr/git.html#most-common`.

The raw Markdown is also reachable without Pages, straight from the repo:
`https://raw.githubusercontent.com/bulmaro/qr/main/git.md`.

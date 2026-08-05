# Quick Reference

Command-line quick reference sheets, plus a small static site that renders them
in a browser. No build step, no dependencies — the `.md` files are the content,
and the site reads them directly.

Live at **https://bulmaro.github.io/qr/**

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

Use the published site: **https://bulmaro.github.io/qr/**

Each page loads its `.md` file with `fetch()`, and browsers refuse that over
`file://` — so double-clicking a sheet page from disk will not work; it shows a
message linking to the published site instead. The overview page is the
exception: it is generated from the `SHEETS` list in `qr.js`, so it works
anywhere.

To preview locally, serve the folder over HTTP:

```bash
python3 -m http.server 8000    # then open http://localhost:8000/
```

The `.md` files remain perfectly readable on their own, with no site at all.

## Layout

```
index.html       overview — generated from the SHEETS list, fetches nothing
<sheet>.html     a ~330-byte shell: <body data-sheet="git">
qr.js            the renderer, the sheet list, the nav — shared by all 7 pages
qr.css           all styling — shared by all 7 pages
<sheet>.md       the sheets — the single source of the content
.nojekyll        keeps GitHub Pages from converting .md files to .html
```

The `.md` files are the only copy of the content. Nothing is duplicated into
the HTML: a sheet page names its source and stops there.

```html
<body data-sheet="git">
<nav id="nav"></nav>
<main id="main"></main>
<script src="qr.js"></script>
```

`qr.js` reads `data-sheet`, fetches `git.md`, renders it into `<main>`, builds
the shared nav (marking the current page), and jumps to `#anchor` if the URL has
one. Navigation between sheets is ordinary links — real pages, not hash routing.

### The renderer

`qr.js` is a hand-rolled line-based Markdown renderer, about 145 lines. It
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

Edit the `.md` file. That's the whole procedure — the page picks it up on
reload, because it holds no copy of its own.

## Adding a sheet

1. Write `foo.md`.
2. Copy any sheet page to `foo.html` and change two things: the `<title>` and
   `data-sheet="foo"`.
3. Add an entry to the `SHEETS` array at the top of [qr.js](qr.js):

```js
{ id: 'foo', blurb: 'What it covers.' }
```

That one entry puts it in the nav on every page and on the overview.
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

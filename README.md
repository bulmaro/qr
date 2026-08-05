# Quick Reference

Command-line quick reference sheets, plus a small static site that renders them in a browser.

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

## Viewing in a browser

The site fetches the `.md` files at runtime, and browsers block `fetch()` over
`file://`, so serve the folder over HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

Any static file server works, as does any static host (S3, GitHub Pages, CloudFront)
— just publish the repo root as-is. There is no build step.

## Features

- Client-side rendering of the Markdown, with GitHub-flavored tables and syntax highlighting
- Full-text search across every sheet — press <kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd>
- Light/dark theme following the OS setting, with a manual override that persists
- Per-sheet table of contents that tracks your scroll position
- Copy buttons on code blocks, linkable headings, and a print stylesheet
- Keyboard navigation: <kbd>↑</kbd>/<kbd>↓</kbd> through results, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close

## Layout

```
index.html            markup and script tags
assets/site.css       styles, including the theme variables
assets/site.js        router, Markdown rendering, search index, TOC
assets/vendor/        marked + highlight.js, vendored (no CDN at runtime)
*.md                  the reference sheets
```

## Adding a sheet

1. Drop `foo.md` in the repo root.
2. Add one entry to the `DOCS` array at the top of [assets/site.js](assets/site.js#L11):

```js
{ file: 'foo.md', name: 'Foo', mark: 'F', lang: 'bash', blurb: 'What it covers.' }
```

Sidebar, overview cards, routing (`#/foo`), pager, and the search index all follow
from that entry. Use `##`/`###` headings so the table of contents has something to build from.

## Dependencies

[marked](https://github.com/markedjs/marked) 15.0.7 (MIT) and
[highlight.js](https://github.com/highlightjs/highlight.js) 11.11.1 (BSD-3-Clause),
committed under `assets/vendor/` so the site works offline and on an isolated network.
To update, replace those files with newer builds.

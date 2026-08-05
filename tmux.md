# tmux Quick Reference

Notation: `C-b` = Ctrl+b (the **prefix**). `C-b c` means press Ctrl+b, release, then `c`.
`M-` = Alt. Shell commands are typed in a terminal; key bindings are pressed inside tmux.

---

## Favorites

| Keys / Command | Action |
|---|---|
| `tmux new -A -s work` | Attach to `work`, or create it if it doesn't exist |

---

## Most Common

| Keys / Command | Action |
|---|---|
| `tmux` | Start a new unnamed session |
| `tmux new -s work` | Start a new session named `work` |
| `tmux a` | Attach to the last session |
| `tmux a -t work` | Attach to session `work` |
| `tmux ls` | List sessions |
| `C-b d` | Detach (session keeps running) |
| `C-b c` | New window |
| `C-b ,` | Rename current window |
| `C-b n` / `C-b p` | Next / previous window |
| `C-b 0`…`9` | Go to window by number |
| `C-b w` | Interactive window/session picker |
| `C-b %` | Split pane vertically (side by side) |
| `C-b "` | Split pane horizontally (stacked) |
| `C-b ←↑↓→` | Move between panes |
| `C-b o` | Cycle to next pane |
| `C-b z` | Zoom / unzoom current pane |
| `C-b x` | Kill current pane (confirms) |
| `C-b &` | Kill current window (confirms) |
| `C-b [` | Enter copy mode (scroll back) |
| `C-b ]` | Paste buffer |
| `C-b ?` | List all key bindings |
| `C-b :` | Command prompt |
| `C-b t` | Big clock |

---

## Sessions

A session is a collection of windows. It survives disconnects — that's the point.

| Keys / Command | Action |
|---|---|
| `tmux new -s NAME` | New session named `NAME` |
| `tmux new -s NAME -d` | Create detached (don't attach) |
| `tmux new -s NAME -c ~/proj` | New session starting in `~/proj` |
| `tmux ls` | List sessions |
| `tmux a` / `tmux attach` | Attach to most recent session |
| `tmux a -t NAME` | Attach to `NAME` |
| `tmux a -d -t NAME` | Attach, detaching any other clients |
| `tmux kill-session -t NAME` | Kill one session |
| `tmux kill-server` | Kill everything |
| `tmux has -t NAME` | Exit 0 if session exists (for scripts) |
| `C-b d` | Detach |
| `C-b $` | Rename session |
| `C-b s` | Interactive session list |
| `C-b (` / `C-b )` | Previous / next session |
| `C-b L` | Switch to last-used session |
| `C-b C-z` | Suspend the tmux client |

Idempotent attach-or-create (handy in `.bashrc` / aliases):

```bash
tmux new -A -s main      # attach if 'main' exists, else create it
```

---

## Windows

A window fills the screen and holds one or more panes — like a tab.

| Keys / Command | Action |
|---|---|
| `C-b c` | New window |
| `C-b ,` | Rename window |
| `C-b &` | Kill window |
| `C-b n` / `C-b p` | Next / previous |
| `C-b l` | Last-used window |
| `C-b 0`…`9` | Select by index |
| `C-b '` | Prompt for window index |
| `C-b w` | Choose window from a tree of all sessions |
| `C-b f` | Find window by name/title/content |
| `C-b .` | Move window to a different index |
| `:swap-window -t 1` | Swap current window with index 1 |
| `:move-window -r` | Renumber all windows sequentially |
| `:new-window -c "#{pane_current_path}"` | New window in the current directory |

---

## Panes

| Keys / Command | Action |
|---|---|
| `C-b %` | Split vertically (left/right) |
| `C-b "` | Split horizontally (top/bottom) |
| `C-b ←↑↓→` | Select pane by direction |
| `C-b o` | Next pane |
| `C-b ;` | Last-used pane |
| `C-b q` | Show pane numbers; press a number to jump |
| `C-b z` | Toggle zoom (fullscreen this pane) |
| `C-b x` | Kill pane |
| `C-b !` | Break pane out into its own window |
| `C-b {` / `C-b }` | Swap pane with previous / next |
| `C-b C-o` / `C-b M-o` | Rotate panes forward / backward |
| `C-b space` | Cycle through preset layouts |
| `C-b M-1`…`M-5` | Apply layout: even-horizontal, even-vertical, main-horizontal, main-vertical, tiled |
| `C-b C-←↑↓→` | Resize pane by 1 cell |
| `C-b M-←↑↓→` | Resize pane by 5 cells |
| `:resize-pane -y 20` | Set height to 20 rows |
| `:split-window -h -c "#{pane_current_path}"` | Split, inheriting the current directory |
| `:join-pane -t :2` | Pull current pane into window 2 |
| `:join-pane -s :3 -t :1` | Move window 3's pane into window 1 |
| `:setw synchronize-panes on` | Type into all panes at once (`off` to stop) |

Your config shows `#{pane_index} #{pane_title}` in a border above each pane. Set a
title with `C-b :` `select-pane -T "build"`, or from the shell: `printf '\033]2;build\033\\'`.

---

## Copy Mode & Scrollback

| Keys | Action |
|---|---|
| `C-b [` | Enter copy mode |
| `q` | Leave copy mode |
| `↑↓` / `C-b PgUp` / `PgDn` | Scroll by line / page |
| `g` / `G` | Top / bottom of history (vi mode) |
| `/` then text | Search forward |
| `?` then text | Search backward |
| `n` / `N` | Next / previous match |
| `space` | Start selection |
| `enter` | Copy selection and exit |
| `C-b ]` | Paste most recent buffer |
| `C-b =` | Choose which buffer to paste |

Notes:

- Default key table is emacs; add `setw -g mode-keys vi` to `~/.tmux.conf` for vi keys
  (then `v` starts selection and `y` copies).
- Mouse is on in your config, so you can also scroll with the wheel and drag-select.
  Hold `Shift` while dragging to bypass tmux and use your terminal's own selection.
- Copy to the system clipboard (X11): `bind -T copy-mode-vi y send -X copy-pipe-and-cancel 'xclip -sel c'`

Useful buffer commands:

```bash
tmux list-buffers                     # show buffers
tmux show-buffer                      # print newest buffer
tmux save-buffer out.txt              # write buffer to a file
tmux capture-pane -p -S -           # dump entire pane history to stdout
tmux capture-pane -pS -3000 > log.txt # last 3000 lines of the pane
```

---

## Command Mode & Scripting

Press `C-b :` for the prompt, or run the same commands from a shell with `tmux <cmd>`.

| Command | Action |
|---|---|
| `tmux send-keys -t work:1.0 'make' Enter` | Type a command into a specific pane |
| `tmux respawn-pane -k` | Restart the pane's process |
| `tmux display-message '#{pane_pid}'` | Show a value from the format language |
| `tmux list-panes -a -F '#{session_name}:#{window_index}.#{pane_index} #{pane_current_command}'` | Inventory of every pane |
| `tmux source-file ~/.tmux.conf` | Reload config |
| `tmux show -g` | Show all global options |
| `tmux lsk` / `tmux list-keys` | Dump key bindings |
| `tmux wait-for -S done` | Sync point for scripts |

Target syntax is `session:window.pane` — e.g. `work:2.1`, `work:build`, `.2` (pane 2 of
current window), `:1` (window 1 of current session).

Session bootstrap script:

```bash
#!/usr/bin/env bash
tmux new -d -s dev -c ~/proj -n edit
tmux send-keys -t dev:edit 'vim .' Enter
tmux new-window -t dev -n server -c ~/proj
tmux send-keys -t dev:server 'npm run dev' Enter
tmux split-window -t dev:server -v -c ~/proj
tmux select-layout -t dev:server even-vertical
tmux attach -t dev
```

---

## Configuration

Config lives in `~/.tmux.conf` (or `~/.config/tmux/tmux.conf`). Reload with
`C-b :` `source-file ~/.tmux.conf`.

```tmux
# Prefix: many people move it to C-a
set -g prefix C-a
bind C-a send-prefix        # C-a C-a sends a literal C-a
unbind C-b

set -g mouse on             # mouse select/resize/scroll
set -g base-index 1         # windows start at 1
setw -g pane-base-index 1   # panes start at 1
set -g history-limit 50000  # scrollback lines
setw -g mode-keys vi        # vi keys in copy mode
set -g renumber-windows on  # close a window, no gaps left
set -sg escape-time 10      # snappier Esc (yours is 200)
set -g focus-events on
set -g default-terminal 'tmux-256color'

# Splits that keep the current directory
bind '"' split-window -v -c "#{pane_current_path}"
bind %   split-window -h -c "#{pane_current_path}"

# Reload config
bind r source-file ~/.tmux.conf \; display 'reloaded'
```

Scopes: `-g` global, `-s` server-wide, `-w`/`setw` window option, `-p` pane option,
`-a` append to an existing value.

---

## Status Bar

| Command | Action |
|---|---|
| `set -g status off` | Hide the status bar |
| `set -g status-position top` | Move it to the top |
| `set -g status-interval 5` | Refresh every 5 seconds |
| `set -g status-left '[#S] '` | Left side: session name |
| `set -g status-right '%Y-%m-%d %H:%M'` | Right side (this is roughly yours) |
| `set -g status-right-length 60` | Room for a longer right side |

Common format variables: `#S` session, `#I` window index, `#W` window name,
`#P` pane index, `#T` pane title, `#H` hostname, `#{pane_current_path}`,
`#{pane_current_command}`, `#{?client_prefix,PREFIX,}` (conditional).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Colors look wrong | `set -g default-terminal 'tmux-256color'` and use `TERM=xterm-256color` outside tmux |
| Esc feels laggy in vim | Lower `escape-time` (yours is 200ms; try 10) |
| Can't copy with the mouse | Hold `Shift` while dragging to use the terminal's own selection |
| Nested tmux (local + remote) | `C-b C-b <key>` sends the prefix to the inner session; or bind `send-prefix` |
| Stale small window after resize | `C-b :` `resize-window -A`, or your `aggressive-resize on` handles most cases |
| Session lost after reboot | tmux does not persist across reboots — use `tmux-resurrect` / `tmux-continuum` |
| `no server running` | Nothing to attach to; start one with `tmux` |

---

## Plugins (TPM)

```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

```tmux
# in ~/.tmux.conf, near the bottom
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'   # save/restore sessions
set -g @plugin 'tmux-plugins/tmux-continuum'   # autosave every 15 min
set -g @plugin 'tmux-plugins/tmux-yank'        # system clipboard copy
run '~/.tmux/plugins/tpm/tpm'
```

`C-b I` install, `C-b U` update, `C-b M-u` remove unused.

---

## Cheat Sheet Card

```
SESSIONS            WINDOWS             PANES               COPY
tmux new -s x       C-b c   new         C-b %   split |     C-b [  enter
tmux a -t x         C-b ,   rename      C-b "   split -     /  ?   search
tmux ls             C-b &   kill        C-b →   move        space  select
C-b d   detach      C-b n p next/prev   C-b z   zoom        enter  copy
C-b $   rename      C-b 0-9 by index    C-b x   kill        C-b ]  paste
C-b s   list        C-b w   picker      C-b q   numbers     q      quit
C-b )   next        C-b f   find        C-b !   to window
```

---

## My `~/.tmux.conf`

```tmux
# Enable mouse support: click to select panes/windows, drag borders to resize,
# wheel to scroll into the pane's history.
set -g mouse on

# When multiple clients are attached, size each window to the most recently
# active client rather than the smallest one (avoids being cramped by a stale
# small terminal).
set -g window-size latest

# Resize each window to the size of the client actively viewing it, instead of
# the smallest client attached to the session.
set -g aggressive-resize on

# Right side of the status bar: date and time in white, then reset attributes.
set -g status-right '#[fg=white]%Y-%m-%d %H:%M#[default]'

# Wait 200ms after Escape to see whether it's the start of a key sequence.
# Generous — lower it (e.g. 10) if Esc feels laggy in vim.
set -s escape-time 200

# Don't send xterm extended (CSI u) key sequences to programs in the pane.
# Server scope (-s) is the effective one for this option.
set -s extended-keys off

# Tell tmux that xterm-256color terminals do support extended keys, appending
# to the existing terminal-features list rather than replacing it.
set -as terminal-features 'xterm-256color:extkeys'

# Draw a status line on the top border of every pane.
set -g pane-border-status top

# Content of that border: the pane's index followed by its title.
set -g pane-border-format "#{pane_index} #{pane_title}"
```

# Git Quick Reference

Notation: `<ref>` is a branch, tag, or commit SHA. `HEAD` is your current commit,
`HEAD~1` its parent, `HEAD~3` three back. `origin` is the default remote name.
Verified against git 2.47.

---

## Most Common

| Command | Action |
|---|---|
| `git status -sb` | Short status with branch and ahead/behind |
| `git add -p` | Stage changes interactively, hunk by hunk |
| `git add .` | Stage everything under the current directory |
| `git commit -m 'msg'` | Commit staged changes |
| `git commit --amend` | Rewrite the last commit (message and/or content) |
| `git diff` | Unstaged changes |
| `git diff --staged` | Staged changes (what a commit would contain) |
| `git log --oneline -20` | Last 20 commits, one line each |
| `git switch main` | Change branch |
| `git switch -c feature` | Create and switch to a new branch |
| `git pull --rebase` | Fetch and replay your commits on top |
| `git push` | Push the current branch |
| `git push -u origin feature` | Push and set upstream on first push |
| `git restore file.txt` | Discard unstaged changes to a file |
| `git restore --staged file.txt` | Unstage, keep the working-tree changes |
| `git stash` / `git stash pop` | Shelve / restore work in progress |
| `git fetch --all --prune` | Update remote refs, drop deleted branches |
| `git show <ref>` | A commit's message and diff |
| `git blame -L 20,40 file` | Who last touched these lines |

---

## Inspecting History

| Command | Action |
|---|---|
| `git log --oneline --graph --decorate --all` | Visual branch topology |
| `git log -p file` | History with diffs for one file |
| `git log --follow file` | Keep tracking across renames |
| `git log -S 'functionName'` | Commits that added/removed this string (pickaxe) |
| `git log -G 'regex'` | Same, but regex over the diff |
| `git log --author=ada --since='2 weeks ago'` | Filter by author and date |
| `git log main..feature` | Commits on `feature` not on `main` |
| `git log --left-right --oneline main...feature` | Divergence in both directions |
| `git log --stat` | Files changed per commit |
| `git log --merges` / `--no-merges` | Only / never merge commits |
| `git shortlog -sn` | Commit counts by author |
| `git show <ref>:path/file` | A file's contents at that commit |
| `git diff <a> <b> -- path` | Compare two refs, scoped to a path |
| `git diff --word-diff` | Word-level diff, good for prose |
| `git diff --stat` | Summary of changed lines |
| `git blame -w -C <file>` | Ignore whitespace, detect moved code |
| `git reflog` | Every place HEAD has been (your safety net) |
| `git describe --tags` | Nearest tag plus distance |

---

## Branches

| Command | Action |
|---|---|
| `git branch` / `-a` / `-r` | Local / all / remote branches |
| `git branch -vv` | With upstream and last commit |
| `git switch <name>` | Check out a branch (modern form) |
| `git switch -c <new> [<start>]` | Create from a start point |
| `git switch -` | Back to the previous branch |
| `git switch --detach <ref>` | Detached HEAD at any commit |
| `git branch -m old new` | Rename a branch |
| `git branch -d <name>` | Delete a merged branch |
| `git branch -D <name>` | Force-delete (unmerged) |
| `git push origin --delete <name>` | Delete the remote branch |
| `git branch --merged` / `--no-merged` | Which are folded in / not |
| `git branch --contains <sha>` | Branches containing a commit |
| `git branch -u origin/main` | Set upstream for the current branch |

`git switch` and `git restore` split the old `git checkout` into "change branch" and
"change files". `git checkout` still works and does both.

---

## Staging & Undoing

| Command | Action |
|---|---|
| `git add -p` | Interactive staging (`y`/`n`/`s` to split/`e` to edit) |
| `git add -u` | Stage modifications and deletions, not new files |
| `git add -A` | Stage everything, whole repo |
| `git restore <file>` | Throw away unstaged changes to a file |
| `git restore --staged <file>` | Unstage but keep the edits |
| `git restore --source=HEAD~2 <file>` | Pull a file back from an older commit |
| `git restore .` | **Destructive** — discard all unstaged changes |
| `git reset --soft HEAD~1` | Undo the commit, keep changes staged |
| `git reset HEAD~1` | Undo the commit, keep changes unstaged (mixed) |
| `git reset --hard HEAD~1` | **Destructive** — undo commit and changes |
| `git revert <sha>` | New commit that undoes an old one (safe on shared branches) |
| `git revert -n <sha>` | Revert without committing yet |
| `git commit --amend --no-edit` | Add staged changes to the last commit, same message |
| `git clean -nd` | Preview which untracked files would be removed |
| `git clean -fd` | **Destructive** — actually remove them |
| `git rm --cached <file>` | Stop tracking, keep on disk |
| `git mv a b` | Rename and stage it |

Recovering from a bad `reset --hard`: `git reflog`, find the SHA you were on, then
`git reset --hard <sha>`. Reflog entries stick around for ~90 days by default.

---

## Stashing

| Command | Action |
|---|---|
| `git stash push -m 'wip: parser'` | Stash with a message |
| `git stash -u` | Include untracked files |
| `git stash -p` | Choose interactively what to stash |
| `git stash list` | Show the stack |
| `git stash show -p stash@{1}` | Diff of a specific stash |
| `git stash pop` | Apply the newest and drop it |
| `git stash apply stash@{2}` | Apply without dropping |
| `git stash branch fix stash@{0}` | New branch from a stash |
| `git stash drop stash@{0}` / `git stash clear` | Delete one / all |

---

## Merging, Rebasing & Cherry-picking

| Command | Action |
|---|---|
| `git merge <branch>` | Merge into the current branch |
| `git merge --no-ff <branch>` | Always create a merge commit |
| `git merge --squash <branch>` | Combine into one staged change |
| `git merge --abort` | Bail out of a conflicted merge |
| `git rebase main` | Replay current branch on top of `main` |
| `git rebase -i HEAD~5` | Interactive: reorder, squash, reword, drop, edit |
| `git rebase --onto main old-base feature` | Move a branch to a new base |
| `git rebase --continue` / `--skip` / `--abort` | Drive a rebase in progress |
| `git rebase -i --autosquash` | Auto-arrange `fixup!`/`squash!` commits |
| `git commit --fixup <sha>` | Mark a commit for autosquash |
| `git cherry-pick <sha>` | Copy one commit here |
| `git cherry-pick <a>..<b>` | A range (exclusive of `a`) |
| `git cherry-pick -x <sha>` | Record the source SHA in the message |
| `git rerere` (config) | Reuse recorded conflict resolutions |

Conflicts:

```bash
git status                 # lists "both modified" files
git diff --diff-filter=U   # just the conflicted hunks
git checkout --ours  file  # keep your side
git checkout --theirs file # keep their side
git add file               # mark resolved
git merge --continue       # or: git rebase --continue
git mergetool              # launch a configured 3-way tool
```

Rule of thumb: rebase your own unpushed work to keep history linear; merge or revert on
branches other people have pulled.

---

## Remotes & Syncing

| Command | Action |
|---|---|
| `git remote -v` | List remotes with URLs |
| `git remote add upstream <url>` | Add a second remote |
| `git remote set-url origin <url>` | Change a remote's URL |
| `git fetch --all --prune` | Update all remote refs, drop stale ones |
| `git pull --rebase` | Rebase instead of merging on pull |
| `git pull --ff-only` | Refuse to pull if it isn't a fast-forward |
| `git push` | Push the current branch to its upstream |
| `git push -u origin <branch>` | Push and record the upstream |
| `git push --force-with-lease` | Safe force-push — fails if someone else pushed |
| `git push --tags` / `--follow-tags` | Push tags |
| `git push origin HEAD:refs/heads/other` | Push to a differently named branch |
| `git ls-remote origin` | Refs on the remote without fetching |
| `git clone --depth 1 <url>` | Shallow clone |
| `git clone --filter=blob:none <url>` | Blobless (partial) clone, fast for big repos |

Never `--force`; use `--force-with-lease`. It rejects the push if the remote moved since
your last fetch, which is exactly the case where `--force` destroys someone's work.

---

## Tags & Releases

| Command | Action |
|---|---|
| `git tag` | List tags |
| `git tag -l 'v1.*'` | Filter |
| `git tag -a v1.2.0 -m 'release'` | Annotated tag (preferred for releases) |
| `git tag v1.2.0-rc1` | Lightweight tag |
| `git tag -a v1.0 <sha>` | Tag an older commit |
| `git push origin v1.2.0` | Push one tag |
| `git tag -d v1.0` | Delete locally |
| `git push origin --delete v1.0` | Delete on the remote |
| `git describe --tags --always --dirty` | Human-readable version string |
| `git archive -o rel.zip v1.2.0` | Export a tree as an archive |

---

## Finding Bugs

| Command | Action |
|---|---|
| `git bisect start` | Begin a binary search |
| `git bisect bad` / `git bisect good <sha>` | Mark endpoints |
| `git bisect run ./test.sh` | Automate — exit 0 = good, non-zero = bad |
| `git bisect reset` | Finish and return to where you were |
| `git blame -L 10,20 -w -C -C file` | Aggressive move/copy detection |
| `git log -S 'symbol' --oneline` | When did this string appear or vanish? |
| `git diff <tag1>..<tag2> --stat` | What changed between releases |
| `git grep 'pattern' <ref>` | Search the tree at any commit |
| `git grep -n --heading -C2 'pat'` | Readable grep with context |

---

## Worktrees & Submodules

| Command | Action |
|---|---|
| `git worktree add ../hotfix hotfix` | Second working directory, same repo |
| `git worktree add -b new ../new main` | Create a branch and a worktree at once |
| `git worktree list` | Show worktrees |
| `git worktree remove ../hotfix` | Clean up |
| `git worktree prune` | Drop stale metadata |
| `git submodule add <url> path` | Add a submodule |
| `git submodule update --init --recursive` | Populate after cloning |
| `git clone --recurse-submodules <url>` | Clone with submodules |
| `git submodule foreach 'git switch main'` | Run a command in each |

Worktrees are the clean way to review a PR or build an old tag without stashing.

---

## Configuration

| Command | Action |
|---|---|
| `git config --global user.name 'Ada'` | Identity |
| `git config --list --show-origin` | Every setting and which file set it |
| `git config --local ...` / `--global` / `--system` | Scope (local wins) |
| `git config --global core.editor 'vim'` | Editor for messages and rebases |
| `git config --global init.defaultBranch main` | Default branch for new repos |
| `git config --global pull.rebase true` | Rebase on pull |
| `git config --global rebase.autosquash true` | Honor `fixup!` automatically |
| `git config --global rerere.enabled true` | Remember conflict resolutions |
| `git config --global diff.colorMoved zebra` | Highlight moved lines distinctly |
| `git config --global fetch.prune true` | Always prune on fetch |
| `git config --global alias.st 'status -sb'` | Alias |
| `git config --global core.excludesFile ~/.gitignore` | Global ignore file |
| `git check-ignore -v <file>` | Which rule is ignoring this? |

`.gitignore` in-repo, `.git/info/exclude` for local-only ignores, `~/.gitignore` global.
`.gitattributes` controls diff drivers, `export-ignore`, and end-of-line handling.

---

## Recovery & Plumbing

| Command | Action |
|---|---|
| `git reflog` / `git reflog show <branch>` | Where HEAD or a branch has been |
| `git reset --hard <sha-from-reflog>` | Return to a prior state |
| `git fsck --lost-found` | Find dangling commits and blobs |
| `git cat-file -p <sha>` | Print any object |
| `git rev-parse HEAD` / `--short HEAD` | Resolve a ref to a SHA |
| `git rev-list --count main` | Number of commits |
| `git gc --prune=now` | Garbage collect (drops unreachable objects) |
| `git count-objects -vH` | Repo size breakdown |
| `git verify-commit <sha>` | Check a GPG signature |
| `git commit -S` | Sign a commit |
| `git bundle create repo.bundle --all` | Single-file transportable repo |
| `git format-patch -3` / `git am < patch` | Email-style patch export/import |
| `git apply --3way patch.diff` | Apply a patch with merge fallback |

Almost nothing is truly lost until `git gc` runs. Check `git reflog` first, always.

---

## Cheat Sheet Card

```
DAILY                  BRANCH                  UNDO                     REMOTE
git status -sb         git switch -c x         git restore f            git fetch --prune
git add -p             git switch -            git restore --staged f   git pull --rebase
git commit -m 'x'      git branch -vv          git reset --soft HEAD~1  git push -u origin x
git commit --amend     git branch -d x         git revert <sha>         git push --force-with-lease
git diff --staged      git merge x             git clean -nd            git remote -v
git log --oneline -20  git rebase -i HEAD~3    git reflog               git ls-remote origin

INSPECT                STASH                   FIND                     WORKTREE
git show <ref>         git stash -u            git bisect run ./t.sh    git worktree add ../d br
git log -S 'str'       git stash list          git log -S 'sym'         git worktree list
git blame -w -C f      git stash pop           git grep -n 'pat'        git worktree remove ../d
git log --graph --all  git stash branch b     git log --follow f       git submodule update --init
```

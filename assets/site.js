/* Quick Reference — static site runtime.
 *
 * Fetches the repo's .md files, renders them with marked, and adds navigation,
 * a hash router, full-text search, and per-page tables of contents. No build step:
 * add a file to DOCS below and drop the .md in the repo root.
 */
(function () {
  'use strict';

  var DOCS = [
    { file: 'bash.md',       name: 'Bash',       mark: '$',   lang: 'bash',       blurb: 'Shell navigation, expansion, redirection, and job control.' },
    { file: 'git.md',        name: 'Git',        mark: '⌥', lang: 'bash',    blurb: 'Branching, history surgery, rebases, and recovery.' },
    { file: 'powershell.md', name: 'PowerShell', mark: 'PS',  lang: 'powershell', blurb: 'Cmdlets, objects, the pipeline, and remoting.' },
    { file: 'python.md',     name: 'Python',     mark: '>>>', lang: 'python',     blurb: 'Idioms, stdlib highlights, and tooling.' },
    { file: 'ruby.md',       name: 'Ruby',       mark: '◆', lang: 'ruby',    blurb: 'Blocks, enumerables, and standard-library patterns.' },
    { file: 'tmux.md',       name: 'tmux',       mark: '⬚', lang: 'bash',    blurb: 'Sessions, windows, panes, and key bindings.' }
  ];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var el = {
    content:  $('#content'),
    docNav:   $('#doc-nav'),
    navHome:  $('.nav-home'),
    toc:      $('#toc'),
    pager:    $('#pager'),
    search:   $('#search'),
    results:  $('#results'),
    sidebar:  $('#sidebar'),
    scrim:    $('.scrim'),
    navToggle: $('.nav-toggle'),
    themeBtn: $('.theme-btn'),
    main:     $('#main')
  };

  /* ---------- theme ---------- */

  var THEME_KEY = 'qr-theme';

  function store(key, value) {
    try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) {/* private mode */}
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    el.themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  var media = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(read(THEME_KEY) || (media.matches ? 'dark' : 'light'));
  media.addEventListener('change', function (e) {
    if (!read(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });
  el.themeBtn.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store(THEME_KEY, next);
  });

  /* ---------- markdown rendering ---------- */

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var slugCounts;

  function slug(text) {
    var base = String(text).toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim().replace(/\s+/g, '-') || 'section';
    var n = slugCounts[base] = (slugCounts[base] || 0) + 1;
    return n > 1 ? base + '-' + n : base;
  }

  var renderer = {
    heading: function (token) {
      var inner = this.parser.parseInline(token.tokens);
      var depth = token.depth;
      if (depth === 1) return '<h1>' + inner + '</h1>\n';
      var id = slug(token.text);
      return '<h' + depth + ' id="' + id + '">' + inner +
        '<a class="anchor" href="#' + id + '" aria-label="Link to this section">#</a>' +
        '</h' + depth + '>\n';
    },
    table: function (token) {
      // marked's default table HTML, wrapped for horizontal scroll on narrow screens.
      var html = marked.Renderer.prototype.table.call(this, token);
      return '<div class="table-wrap">' + html + '</div>\n';
    },
    code: function (token) {
      var lang = (token.lang || '').match(/^[\w+#-]*/)[0].toLowerCase();
      var code = token.text;
      // Fence tags highlight.js doesn't ship, mapped to a grammar that fits.
      // 'tmux' blocks are .tmux.conf snippets: # comments, quoted strings, flags.
      var hl = ({ tmux: 'bash', conf: 'ini', console: 'bash', shell: 'bash', sh: 'bash' })[lang] || lang;
      var body;
      if (hl && hljs.getLanguage(hl)) {
        body = hljs.highlight(code, { language: hl, ignoreIllegals: true }).value;
      } else {
        body = escapeHtml(code);
      }
      return '<div class="code-block"><pre><code class="hljs' +
        (lang ? ' language-' + lang : '') + '">' + body + '</code></pre>' +
        '<button class="copy-btn" type="button">Copy</button></div>\n';
    }
  };

  marked.use({ renderer: renderer, gfm: true, breaks: false });

  function renderMarkdown(md) {
    slugCounts = {};
    return marked.parse(md);
  }

  /* ---------- document loading ---------- */

  var cache = {};

  function loadDoc(doc) {
    if (cache[doc.file]) return Promise.resolve(cache[doc.file]);
    return fetch(doc.file, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      return res.text();
    }).then(function (md) {
      cache[doc.file] = md;
      return md;
    });
  }

  function findDoc(fileOrSlug) {
    for (var i = 0; i < DOCS.length; i++) {
      if (DOCS[i].file === fileOrSlug || DOCS[i].file.replace(/\.md$/, '') === fileOrSlug) return DOCS[i];
    }
    return null;
  }

  /* ---------- sidebar ---------- */

  DOCS.forEach(function (doc) {
    var key = doc.file.replace(/\.md$/, '');
    var li = document.createElement('li');
    li.innerHTML = '<a href="#/' + key + '"><span class="nav-icon" aria-hidden="true">' +
      escapeHtml(doc.mark) + '</span>' + escapeHtml(doc.name) + '</a>';
    el.docNav.appendChild(li);
  });

  function markCurrentNav(key) {
    $$('.doc-nav a, .nav-home').forEach(function (a) {
      var href = a.getAttribute('href');
      var isCurrent = key ? href === '#/' + key : href === '#/';
      isCurrent ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
  }

  /* ---------- sidebar drawer (small screens) ---------- */

  function setNav(open) {
    el.sidebar.classList.toggle('open', open);
    el.scrim.hidden = !open;
    el.navToggle.setAttribute('aria-expanded', String(open));
  }
  el.navToggle.addEventListener('click', function () {
    setNav(!el.sidebar.classList.contains('open'));
  });
  el.scrim.addEventListener('click', function () { setNav(false); });
  el.sidebar.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });

  /* ---------- table of contents ---------- */

  var tocObserver = null;

  function buildToc() {
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }
    el.toc.innerHTML = '';

    var heads = $$('#content h2, #content h3');
    if (heads.length < 2) return;

    var html = '<p class="toc-title">On this page</p><ul>';
    heads.forEach(function (h) {
      html += '<li class="lvl-' + h.tagName[1] + '"><a href="#' + h.id + '">' +
        escapeHtml(h.textContent.replace(/#$/, '')) + '</a></li>';
    });
    el.toc.innerHTML = html + '</ul>';

    // TOC links are in-page anchors; let them scroll natively but keep the hash route intact.
    $$('#toc a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
      });
    });

    var links = {};
    $$('#toc a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });

    var visible = new Set();
    tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id);
      });
      // Highlight the topmost heading currently in view, else the last one scrolled past.
      var activeId = null;
      for (var i = 0; i < heads.length; i++) {
        if (visible.has(heads[i].id)) { activeId = heads[i].id; break; }
      }
      if (!activeId) {
        for (var j = heads.length - 1; j >= 0; j--) {
          if (heads[j].getBoundingClientRect().top < 120) { activeId = heads[j].id; break; }
        }
      }
      $$('#toc a.active').forEach(function (a) { a.classList.remove('active'); });
      if (activeId && links[activeId]) links[activeId].classList.add('active');
    }, { rootMargin: '-' + (document.querySelector('.topbar').offsetHeight + 8) + 'px 0px -70% 0px' });

    heads.forEach(function (h) { tocObserver.observe(h); });
  }

  /* ---------- copy buttons ---------- */

  el.content.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var code = btn.parentNode.querySelector('code');
    var text = code ? code.textContent : '';
    var done = function (ok) {
      btn.textContent = ok ? 'Copied' : 'Failed';
      btn.classList.toggle('done', ok);
      setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      // file:// and older browsers: fall back to a hidden textarea + execCommand.
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  });

  /* ---------- search index ---------- */

  var index = null;      // array of {doc, docName, docKey, heading, headingId, text}
  var indexing = null;   // in-flight promise

  function stripMd(s) {
    return s
      .replace(/`([^`]*)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\*\*([^*]*)\*\*/g, '$1')
      .replace(/\*([^*]*)\*/g, '$1')
      .replace(/^[|>\s-]+/, '')
      .replace(/\s*\|\s*/g, ' — ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function buildIndex() {
    if (index) return Promise.resolve(index);
    if (indexing) return indexing;

    indexing = Promise.all(DOCS.map(function (doc) {
      return loadDoc(doc).then(function (md) { return { doc: doc, md: md }; },
                               function () { return null; });
    })).then(function (loaded) {
      var rows = [];
      loaded.filter(Boolean).forEach(function (entry) {
        var doc = entry.doc;
        var docKey = doc.file.replace(/\.md$/, '');
        var heading = doc.name, headingId = '';
        var inFence = false;
        slugCounts = {};

        entry.md.split('\n').forEach(function (line) {
          if (/^\s*```/.test(line)) { inFence = !inFence; return; }

          var h = !inFence && line.match(/^(#{2,4})\s+(.*)$/);
          if (h) {
            heading = stripMd(h[2]);
            headingId = slug(h[2].trim());
            return;
          }
          if (/^\s*\|?\s*:?-{2,}/.test(line)) return;   // table separator rows
          if (/^#\s/.test(line)) return;                // doc title

          var text = stripMd(line);
          if (text.length < 2) return;
          rows.push({
            docName: doc.name, docKey: docKey,
            heading: heading, headingId: headingId,
            text: text, lower: text.toLowerCase(),
            headingLower: heading.toLowerCase()
          });
        });
      });
      index = rows;
      return rows;
    });

    return indexing;
  }

  function reEscape(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Collect match ranges on the raw text first, merge overlaps, then escape each
  // segment separately - so <mark> is the only markup that reaches innerHTML.
  function highlight(text, terms) {
    var ranges = [];
    terms.forEach(function (term) {
      if (!term) return;
      var re = new RegExp(reEscape(term), 'gi');
      var m;
      while ((m = re.exec(text)) !== null) {
        if (m[0].length === 0) { re.lastIndex++; continue; }
        ranges.push([m.index, m.index + m[0].length]);
      }
    });
    if (!ranges.length) return escapeHtml(text);

    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0].slice()];
    for (var i = 1; i < ranges.length; i++) {
      var last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
      else merged.push(ranges[i].slice());
    }

    var out = '', pos = 0;
    merged.forEach(function (r) {
      out += escapeHtml(text.slice(pos, r[0])) +
             '<mark>' + escapeHtml(text.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return out + escapeHtml(text.slice(pos));
  }

  var MAX_RESULTS = 40;

  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return { hits: [], total: 0, terms: terms };

    var hits = [];
    for (var i = 0; i < index.length; i++) {
      var row = index[i];
      var score = 0, matchedAll = true;

      for (var t = 0; t < terms.length; t++) {
        var pos = row.lower.indexOf(terms[t]);
        var inHeading = row.headingLower.indexOf(terms[t]) !== -1;
        if (pos === -1 && !inHeading) { matchedAll = false; break; }
        if (pos === 0) score += 12;            // line starts with the term
        else if (pos > 0) score += 6;
        if (inHeading) score += 4;
        if (new RegExp('\\b' + terms[t].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(row.lower)) score += 3;
      }
      if (!matchedAll) continue;
      score -= Math.min(row.text.length / 120, 3);   // prefer concise lines
      hits.push({ row: row, score: score });
    }

    hits.sort(function (a, b) { return b.score - a.score; });
    return { hits: hits.slice(0, MAX_RESULTS), total: hits.length, terms: terms };
  }

  var activeResult = -1;

  function renderResults(query) {
    if (!query) { closeResults(); return; }

    var out = search(query);
    activeResult = -1;

    if (!out.hits.length) {
      el.results.innerHTML = '<p class="results-empty">No matches for &ldquo;' + escapeHtml(query) + '&rdquo;</p>';
    } else {
      var html = out.hits.map(function (hit) {
        var row = hit.row;
        var href = '#/' + row.docKey + (row.headingId ? '#' + row.headingId : '');
        return '<a class="result" href="' + href + '" role="option">' +
          '<span class="result-top">' +
            '<span class="result-doc">' + escapeHtml(row.docName) + '</span>' +
            '<span class="result-head">' + highlight(row.heading, out.terms) + '</span>' +
          '</span>' +
          '<span class="result-text">' + highlight(row.text, out.terms) + '</span>' +
        '</a>';
      }).join('');
      if (out.total > out.hits.length) {
        html += '<p class="results-foot">Showing ' + out.hits.length + ' of ' + out.total + ' matches</p>';
      }
      el.results.innerHTML = html;
    }

    el.results.hidden = false;
    el.search.setAttribute('aria-expanded', 'true');
  }

  function closeResults() {
    el.results.hidden = true;
    el.results.innerHTML = '';
    el.search.setAttribute('aria-expanded', 'false');
    activeResult = -1;
  }

  function moveActive(delta) {
    var items = $$('.result', el.results);
    if (!items.length) return;
    if (activeResult >= 0 && items[activeResult]) items[activeResult].classList.remove('active');
    // States run from -1 (search input focused) through items.length - 1, and wrap.
    var slots = items.length + 1;
    activeResult = (((activeResult + 1 + delta) % slots) + slots) % slots - 1;
    if (activeResult < 0) { el.search.focus(); return; }
    items[activeResult].classList.add('active');
    items[activeResult].scrollIntoView({ block: 'nearest' });
  }

  var searchTimer = null;

  el.search.addEventListener('input', function () {
    var query = el.search.value.trim();
    el.search.parentNode.classList.toggle('filled', !!el.search.value);
    clearTimeout(searchTimer);
    if (!query) { closeResults(); return; }
    searchTimer = setTimeout(function () {
      buildIndex().then(function () { renderResults(el.search.value.trim()); });
    }, 90);
  });

  el.search.addEventListener('focus', function () {
    buildIndex();
    if (el.search.value.trim() && el.results.innerHTML) el.results.hidden = false;
  });

  el.search.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveActive(-1); }
    else if (e.key === 'Enter') {
      var items = $$('.result', el.results);
      var target = items[activeResult >= 0 ? activeResult : 0];
      if (target) { e.preventDefault(); target.click(); }
    } else if (e.key === 'Escape') {
      if (!el.results.hidden) { closeResults(); }
      else { el.search.value = ''; el.search.parentNode.classList.remove('filled'); el.search.blur(); }
    }
  });

  el.results.addEventListener('click', function (e) {
    if (e.target.closest('.result')) {
      closeResults();
      el.search.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!el.results.hidden && !e.target.closest('.results') && !e.target.closest('.search-wrap')) closeResults();
  });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
                 document.activeElement.isContentEditable;
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      el.search.focus();
      el.search.select();
    } else if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      el.search.focus();
      el.search.select();
    } else if (e.key === 'Escape') {
      if (el.sidebar.classList.contains('open')) setNav(false);
    }
  });

  /* ---------- pager ---------- */

  function renderPager(doc) {
    var i = DOCS.indexOf(doc);
    if (i === -1) { el.pager.innerHTML = ''; return; }
    var prev = DOCS[i - 1], next = DOCS[i + 1];
    var html = '';
    if (prev) {
      html += '<a class="prev" href="#/' + prev.file.replace(/\.md$/, '') + '">' +
        '<span class="dir">← Previous</span><span class="name">' + escapeHtml(prev.name) + '</span></a>';
    }
    if (next) {
      html += '<a class="next" href="#/' + next.file.replace(/\.md$/, '') + '">' +
        '<span class="dir">Next →</span><span class="name">' + escapeHtml(next.name) + '</span></a>';
    }
    el.pager.innerHTML = html;
  }

  /* ---------- pages ---------- */

  // Pull the '## ' section titles out of a sheet so cards can preview its contents.
  function sectionsOf(md) {
    var out = [], inFence = false;
    md.split('\n').forEach(function (line) {
      if (/^\s*```/.test(line)) { inFence = !inFence; return; }
      if (inFence) return;
      var m = line.match(/^##\s+(.*)$/);
      if (m) out.push(stripMd(m[1]));
    });
    return out;
  }

  function cardHtml(doc, sections) {
    var key = doc.file.replace(/\.md$/, '');
    var html = '<li><a class="card" href="#/' + key + '">' +
      '<span class="card-head"><span class="card-mark" aria-hidden="true">' + escapeHtml(doc.mark) + '</span>' +
      escapeHtml(doc.name) + '</span>' +
      '<p>' + escapeHtml(doc.blurb) + '</p>';

    if (sections && sections.length) {
      var shown = sections.slice(0, 5);
      html += '<span class="card-sections">' +
        shown.map(function (s) { return '<span class="chip">' + escapeHtml(s) + '</span>'; }).join('') +
        (sections.length > shown.length
          ? '<span class="chip chip-more">+' + (sections.length - shown.length) + ' more</span>'
          : '') +
        '</span>';
    }

    return html + '<span class="card-meta">' + escapeHtml(doc.file) + '</span></a></li>';
  }

  function renderHome() {
    document.title = 'Quick Reference';
    markCurrentNav(null);
    el.toc.innerHTML = '';
    el.pager.innerHTML = '';
    if (tocObserver) { tocObserver.disconnect(); tocObserver = null; }

    el.content.innerHTML =
      '<div class="hero"><h1>Quick Reference</h1>' +
      '<p>Command sheets for the tools in daily rotation. Open one below, ' +
      'or press <kbd>/</kbd> to search across all of them.</p></div>' +
      '<ul class="card-grid">' +
      DOCS.map(function (doc) { return cardHtml(doc, null); }).join('') +
      '</ul>';
    el.content.setAttribute('aria-busy', 'false');

    // Fill in section chips once the sheets are available; the cards are usable
    // immediately either way, so a failed/slow load just leaves them off.
    var token = ++homeToken;
    Promise.all(DOCS.map(function (doc) {
      return loadDoc(doc).then(sectionsOf, function () { return []; });
    })).then(function (all) {
      if (token !== homeToken || current.key !== '') return;   // navigated away
      var grid = el.content.querySelector('.card-grid');
      if (!grid) return;
      grid.innerHTML = DOCS.map(function (doc, i) { return cardHtml(doc, all[i]); }).join('');
    });
  }

  var homeToken = 0;

  function scrollToAnchor(id) {
    if (!id) { window.scrollTo(0, 0); return; }
    var target = document.getElementById(id);
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }

  function renderDoc(doc, anchor) {
    document.title = doc.name + ' · Quick Reference';
    markCurrentNav(doc.file.replace(/\.md$/, ''));
    el.content.setAttribute('aria-busy', 'true');
    el.content.innerHTML = '<p class="status">Loading ' + escapeHtml(doc.file) + '…</p>';
    el.pager.innerHTML = '';

    loadDoc(doc).then(function (md) {
      el.content.innerHTML = renderMarkdown(md);
      el.content.setAttribute('aria-busy', 'false');
      buildToc();
      renderPager(doc);
      scrollToAnchor(anchor);
    }, function (err) {
      el.content.setAttribute('aria-busy', 'false');
      var isFile = location.protocol === 'file:';
      el.content.innerHTML =
        '<div class="status"><p>Could not load <code>' + escapeHtml(doc.file) + '</code> — ' +
        escapeHtml(err.message) + '</p>' +
        (isFile
          ? '<p class="status-hint">Browsers block <code>fetch()</code> over <code>file://</code>. Serve the folder over HTTP:' +
            '<pre>python3 -m http.server 8000</pre></p>'
          : '<p class="status-hint">Check that the file exists next to <code>index.html</code>.</p>') +
        '</div>';
    });
  }

  /* ---------- router ---------- */

  // Routes look like #/git or #/git#rebasing — the second '#' is an in-page anchor.
  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, '');
    if (!raw) return { key: '', anchor: '' };
    var parts = raw.split('#');
    return { key: parts[0], anchor: parts[1] || '' };
  }

  var current = { key: null, anchor: null };

  function route() {
    var r = parseHash();

    if (!r.key) {
      current = { key: '', anchor: '' };
      renderHome();
      return;
    }

    var doc = findDoc(r.key);
    if (!doc) {
      current = { key: r.key, anchor: r.anchor };
      markCurrentNav(null);
      el.toc.innerHTML = '';
      el.pager.innerHTML = '';
      el.content.innerHTML = '<div class="status"><p>No sheet named <code>' + escapeHtml(r.key) +
        '</code>.</p><p class="status-hint"><a href="#/">Back to the overview</a></p></div>';
      el.content.setAttribute('aria-busy', 'false');
      return;
    }

    // Same document, different anchor: just scroll, don't re-render.
    if (current.key === r.key) {
      current.anchor = r.anchor;
      scrollToAnchor(r.anchor);
      return;
    }

    current = { key: r.key, anchor: r.anchor };
    renderDoc(doc, r.anchor);
  }

  window.addEventListener('hashchange', route);
  route();
})();

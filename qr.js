/* Shared by index.html and every sheet page.

   A sheet page is a short shell that names its source:
     <body data-sheet="git">
   qr.js fetches git.md and renders it, so the .md files are the only copy of
   the content — nothing is duplicated into the HTML.

   fetch() cannot read local files, so this needs http(s); opening a page from
   disk shows a message pointing at the published site. See README.md. */

var SHEETS = [
  { id: 'bash',       blurb: 'Navigation, expansion, redirection, job control' },
  { id: 'git',        blurb: 'Branching, history surgery, rebases, recovery' },
  { id: 'powershell', blurb: 'Cmdlets, objects, the pipeline, remoting' },
  { id: 'python',     blurb: 'Idioms, stdlib highlights, tooling' },
  { id: 'ruby',       blurb: 'Blocks, enumerables, stdlib patterns' },
  { id: 'tmux',       blurb: 'Sessions, windows, panes, key bindings' }
];

var SITE = 'https://bulmaro.github.io/qr/';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Inline spans. Code is pulled out first so ** and [] inside it stay literal.
// The sentinels must stay as escapes, never literal chars: some tools drop them.
function inline(s) {
  var codes = [];
  s = s.replace(/`([^`]*)`/g, function (m, c) { codes.push(c); return '\uE000' + (codes.length - 1) + '\uE001'; });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s.replace(/\uE000(\d+)\uE001/g, function (m, n) { return '<code>' + esc(codes[n]) + '</code>'; });
}

// Split a table row on unescaped pipes; '\|' is a literal pipe in a cell.
function cells(line) {
  var s = line.trim().replace(/^\|/, '').replace(/\|$/, ''), out = [], cur = '';
  for (var i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; }
    else if (s[i] === '|') { out.push(cur.trim()); cur = ''; }
    else cur += s[i];
  }
  out.push(cur.trim());
  return out;
}

function slug(s) {
  return s.toLowerCase().replace(/`/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function render(src) {
  var lines = src.split('\n'), out = [], i = 0, m;

  while (i < lines.length) {
    var line = lines[i];

    if (/^```/.test(line)) {                                   // fenced code
      var buf = [];
      for (i++; i < lines.length && !/^```/.test(lines[i]); i++) buf.push(lines[i]);
      i++;
      out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');

    } else if (line[0] === '|' && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] || '')) {   // table
      var head = cells(line), rows = [];
      for (i += 2; i < lines.length && lines[i][0] === '|'; i++) rows.push(cells(lines[i]));
      out.push('<table><thead><tr><th>' + head.map(inline).join('</th><th>') + '</th></tr></thead><tbody>' +
        rows.map(function (r) { return '<tr><td>' + r.map(inline).join('</td><td>') + '</td></tr>'; }).join('') +
        '</tbody></table>');

    } else if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {         // heading
      var d = m[1].length;
      out.push('<h' + d + ' id="' + slug(m[2]) + '">' + inline(m[2]) + '</h' + d + '>');
      i++;

    } else if (/^(-{3,}|\*{3,})\s*$/.test(line)) {              // rule
      out.push('<hr>');
      i++;

    } else if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {             // list
      var items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(inline(lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, '')));
      }
      out.push('<ul><li>' + items.join('</li><li>') + '</li></ul>');

    } else if (!line.trim()) {                                  // blank
      i++;

    } else {                                                    // paragraph
      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^(#{1,4}\s|```|\||-{3,}\s*$|\s*([-*+]|\d+\.)\s)/.test(lines[i])) para.push(lines[i++]);
      out.push('<p>' + inline(para.join(' ')) + '</p>');
    }
  }
  return out.join('\n');
}

var main = document.getElementById('main');
var here = location.pathname.split('/').pop() || 'index.html';
var sheet = document.body.getAttribute('data-sheet');

document.getElementById('nav').innerHTML =
  [{ id: 'index', label: 'Overview' }].concat(SHEETS).map(function (s) {
    var file = s.id + '.html';
    return '<a class="' + (file === here ? 'on' : '') + '" href="' + file + '">' +
           (s.label || s.id) + '</a>';
  }).join('');

// The overview is generated from SHEETS, so it has no source file of its own.
function overview() {
  return '# Quick Reference\n\nCommand-line cheat sheets, rendered in the browser.\n\n' +
    SHEETS.map(function (s) { return '- [' + s.id + '](' + s.id + '.html) — ' + s.blurb; }).join('\n') + '\n';
}

// We render after load, so the browser's own jump to #anchor has already missed.
function jump() {
  var target = location.hash && document.getElementById(location.hash.slice(1));
  if (target) target.scrollIntoView();
}

if (!sheet) {
  main.innerHTML = render(overview());
  jump();
} else {
  fetch(sheet + '.md').then(function (r) {
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return r.text();
  }).then(function (md) {
    main.innerHTML = render(md);
    jump();
  }).catch(function (e) {
    document.title = 'Unavailable · Quick Reference';
    main.innerHTML = '<h1>Could not load ' + esc(sheet) + '.md</h1>' +
      (location.protocol === 'file:'
        ? '<p>Browsers block scripts from reading local files, so opening this page ' +
          'from disk cannot work. Use the published site:</p><p><a href="' +
          SITE + esc(sheet) + '.html">' + SITE + esc(sheet) + '.html</a></p>' +
          '<p>Or read the source directly: <a href="' + esc(sheet) + '.md">' +
          esc(sheet) + '.md</a></p>'
        : '<p>' + esc(e.message) + ' — is ' + esc(sheet) + '.md present next to this page?</p>');
  });
}

/* Shared by index.html and every sheet page. Each page embeds its Markdown in
   <script id="md" type="text/markdown">, so nothing is fetched and this works
   straight off the filesystem — no server, ever. */

var SHEETS = ['bash', 'git', 'powershell', 'python', 'ruby', 'tmux'];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Inline spans. Code is pulled out first so ** and [] inside it stay literal.
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

var here = (location.pathname.split('/').pop() || 'index.html');

document.getElementById('nav').innerHTML =
  ['index.html'].concat(SHEETS.map(function (s) { return s + '.html'; })).map(function (f) {
    return '<a class="' + (f === here ? 'on' : '') + '" href="' + f + '">' +
           (f === 'index.html' ? 'Overview' : f.replace('.html', '')) + '</a>';
  }).join('');

document.getElementById('main').innerHTML = render(document.getElementById('md').textContent);

// The page renders after load, so the browser's own anchor jump has already missed.
var target = location.hash && document.getElementById(location.hash.slice(1));
if (target) target.scrollIntoView();

// ── NETLIFY FUNCTION: /.netlify/functions/opportunities ───────────────────
// Reads content/opportunities/*.md (managed via Netlify CMS "Member Opportunities" collection)
// Returns JSON array of active member bid opportunities.

const fs   = require('fs');
const path = require('path');

exports.handler = async function() {
  try {
    const dir = path.join(process.cwd(), 'content', 'opportunities');
    if (!fs.existsSync(dir)) return respond([]);

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const items = [];

    for (const file of files) {
      try {
        const raw  = fs.readFileSync(path.join(dir, file), 'utf8');
        const data = parseFrontmatter(raw);
        if (data.active === false || data.active === 'false') continue;
        items.push({
          title:            data.title            || '',
          rfp_number:       data.rfp_number       || '',
          issuer:           data.issuer           || '',
          location:         data.location         || '',
          value:            data.value            || '',
          category:         data.category         || '',
          tags:             Array.isArray(data.tags) ? data.tags : parseTags(data.tags),
          description:      data.description      || '',
          deadline:         data.deadline         || '',
          deadline_display: data.deadline_display || '',
          button_text:      data.button_text      || 'View Opportunity →',
          button_link:      data.button_link      || '',
          posted_date:      data.posted_date      || '',
        });
      } catch (_) {}
    }

    // Sort by deadline ascending (soonest first)
    items.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    return respond(items);
  } catch (err) {
    console.error('opportunities function error:', err);
    return respond([]);
  }
};

function parseTags(raw) {
  if (!raw) return [];
  if (typeof raw !== 'string') return [];
  if (raw.includes('\n')) {
    return raw.split('\n').map(t => t.replace(/^-\s*/, '').trim()).filter(Boolean);
  }
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const obj = {};
  const lines = match[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const sep = line.indexOf(':');
    if (sep < 1) { i++; continue; }
    const key = line.slice(0, sep).trim();
    let   val = line.slice(sep + 1).trim();
    if (val === '' && lines[i+1] && lines[i+1].trimStart().startsWith('-')) {
      const listLines = [];
      i++;
      while (i < lines.length && lines[i].trimStart().startsWith('-')) {
        listLines.push(lines[i].replace(/^[\s-]+/, '').trim());
        i++;
      }
      obj[key] = listLines;
      continue;
    }
    if (val === 'true')  { obj[key] = true;  i++; continue; }
    if (val === 'false') { obj[key] = false; i++; continue; }
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    obj[key] = val;
    i++;
  }
  return obj;
}

function respond(data) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
    body: JSON.stringify(data),
  };
}

// ── NETLIFY FUNCTION: /.netlify/functions/rfps ────────────────────────────
// Reads content/rfps/*.md (managed via Netlify CMS "BCOE Procurement RFPs" collection)
// Returns JSON array of active BCOE-issued RFP listings.
// BCOE is the buyer/issuer — these are services BCOE is procuring.

const fs   = require('fs');
const path = require('path');

exports.handler = async function() {
  try {
    const dir = path.join(process.cwd(), 'content', 'rfps');
    if (!fs.existsSync(dir)) return respond([]);

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const rfps  = [];

    for (const file of files) {
      try {
        const raw  = fs.readFileSync(path.join(dir, file), 'utf8');
        const data = parseFrontmatter(raw);
        if (data.active === false || data.active === 'false') continue;

        // rfp_document is a Cloudinary URL stored by Netlify CMS file widget
        // button_link is a fallback if no PDF was uploaded
        const documentUrl = data.rfp_document || data.button_link || '';

        rfps.push({
          title:            data.title            || '',
          rfp_number:       data.rfp_number       || '',
          location:         data.location         || '',
          budget:           data.budget           || '',
          category:         data.category         || '',
          scope_of_work:    data.scope_of_work    || '',
          tags:             Array.isArray(data.tags) ? data.tags : parseTags(data.tags),
          description:      data.description      || '',
          rfp_document:     data.rfp_document     || '',
          deadline:         data.deadline         || '',
          deadline_display: data.deadline_display || '',
          button_text:      data.button_text      || 'Download RFP →',
          button_link:      documentUrl,
          posted_date:      data.posted_date      || '',
        });
      } catch (_) {}
    }

    // Sort by deadline ascending (soonest first)
    rfps.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    return respond(rfps);
  } catch (err) {
    console.error('rfps function error:', err);
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

    // Multi-line list (tags)
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

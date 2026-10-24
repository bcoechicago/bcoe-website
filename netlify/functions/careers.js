// ── NETLIFY FUNCTION: /.netlify/functions/careers ─────────────────────────
// Reads content/careers/*.md (managed via Netlify CMS "Careers" collection)
// Returns JSON array of active job listings for the Careers page.

const fs   = require('fs');
const path = require('path');

exports.handler = async function() {
  try {
    const dir = path.join(process.cwd(), 'content', 'careers');
    if (!fs.existsSync(dir)) return respond([]);

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    const jobs  = [];

    for (const file of files) {
      try {
        const raw  = fs.readFileSync(path.join(dir, file), 'utf8');
        const data = parseFrontmatter(raw);
        if (data.active === false || data.active === 'false') continue;
        jobs.push({
          title:        data.title        || '',
          company:      data.company      || '',
          location:     data.location     || '',
          job_type:     data.job_type     || '',
          category:     data.category     || '',
          experience:   data.experience   || '',
          description:  data.description  || '',
          badge:        data.badge        || '',
          button_text:  data.button_text  || 'Apply Now →',
          button_link:  data.button_link  || '',
          posted_date:  data.posted_date  || '',
        });
      } catch (_) {}
    }

    return respond(jobs);
  } catch (err) {
    console.error('careers function error:', err);
    return respond([]);
  }
};

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const obj = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':');
    if (sep < 1) continue;
    const key = line.slice(0, sep).trim();
    let   val = line.slice(sep + 1).trim();
    if (val === 'true')  { obj[key] = true;  continue; }
    if (val === 'false') { obj[key] = false; continue; }
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    obj[key] = val;
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

// Netlify Function: /.netlify/functions/events
// Returns a JSON array of all events from content/events/*.md
// Called by the homepage to get the current event list dynamically.

const fs = require('fs');
const path = require('path');

exports.handler = async function() {
  try {
    const dir = path.join(__dirname, '../../content/events');

    if (!fs.existsSync(dir)) {
      return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: '[]' };
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

    const events = files.map(filename => {
      try {
        const text = fs.readFileSync(path.join(dir, filename), 'utf8');
        const match = text.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return null;
        const data = { _file: '/content/events/' + filename };
        match[1].split('\n').forEach(line => {
          const idx = line.indexOf(':');
          if (idx === -1) return;
          const key = line.slice(0, idx).trim();
          let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          data[key] = val;
        });
        return data;
      } catch(e) { return null; }
    }).filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60'
      },
      body: JSON.stringify(events)
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstImage(html) {
  if (!html) return null;
  // Look for a reasonably sized content image, skipping tiny tracking pixels/spacers
  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  for (const m of matches) {
    const src = m[1];
    if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(src) && !/spacer|pixel|beacon/i.test(src)) {
      return src;
    }
  }
  return matches.length ? matches[0][1] : null;
}

exports.handler = async function () {
  try {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;

    if (!apiKey || !listId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID" }),
      };
    }

    const dc = apiKey.split("-").pop();
    const authHeader = "Basic " + Buffer.from("anystring:" + apiKey).toString("base64");

    const listRes = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/campaigns?list_id=${listId}&status=sent&count=10&sort_field=send_time&sort_dir=DESC`,
      { headers: { Authorization: authHeader } }
    );

    if (!listRes.ok) {
      const errText = await listRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: "Mailchimp list fetch failed", detail: errText }) };
    }

    const listData = await listRes.json();
    const campaigns = listData.campaigns || [];

    const articles = await Promise.all(
      campaigns.map(async (c) => {
        let excerpt = "";
        let image = null;
        try {
          const contentRes = await fetch(
            `https://${dc}.api.mailchimp.com/3.0/campaigns/${c.id}/content`,
            { headers: { Authorization: authHeader } }
          );
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            excerpt = stripHtml(contentData.plain_text || contentData.html || "").slice(0, 220);
            if (excerpt.length === 220) excerpt += "…";
            image = extractFirstImage(contentData.html);
          }
        } catch (e) {
          excerpt = "";
        }

        const hasRealLink = Boolean(c.archive_url || c.long_archive_url);

        return {
          emoji: "📰",
          image: image,
          tag: "BCOE Update",
          title: (c.settings && c.settings.subject_line) || "BCOE Newsletter",
          excerpt: excerpt,
          date: c.send_time
            ? new Date(c.send_time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "",
          linkText: hasRealLink ? "Read Full Email →" : "Link unavailable",
          link: hasRealLink ? (c.archive_url || c.long_archive_url) : null,
          publishDate: c.send_time || "",
        };
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      body: JSON.stringify({ articles }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

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
        try {
          const contentRes = await fetch(
            `https://${dc}.api.mailchimp.com/3.0/campaigns/${c.id}/content`,
            { headers: { Authorization: authHeader } }
          );
          if (contentRes.ok) {
            const contentData = await contentRes.json();
            excerpt = stripHtml(contentData.plain_text || contentData.html || "").slice(0, 220);
            if (excerpt.length === 220) excerpt += "…";
          }
        } catch (e) {
          excerpt = "";
        }

        return {
          emoji: "📰",
          tag: "BCOE Update",
          title: (c.settings && c.settings.subject_line) || "BCOE Newsletter",
          excerpt: excerpt,
          date: c.send_time
            ? new Date(c.send_time).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "",
          linkText: "Read Full Email →",
          link: c.archive_url || c.long_archive_url || "#",
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

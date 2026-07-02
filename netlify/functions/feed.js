const newsData = require("../../content/news.json");

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

exports.handler = async function () {
  const siteUrl = "https://bcoechicago.org";

  const articles = (newsData.articles || [])
    .slice()
    .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));

  const items = articles
    .map((a) => {
      const link = /^https?:\/\//.test(a.link)
        ? a.link
        : `${siteUrl}/${a.link.replace(/^\/+/, "")}`;
      const pubDate = a.publishDate
        ? new Date(a.publishDate).toUTCString()
        : new Date().toUTCString();
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(a.title)}-${escapeXml(a.publishDate || "")}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(a.tag || "")}</category>
      <description>${escapeXml(a.excerpt || "")}</description>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BCOE Chicago — News You Can Use</title>
    <link>${siteUrl}/news.html</link>
    <description>Industry news, legislative updates, and member resources from BCOE Chicago.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/rss+xml; charset=UTF-8" },
    body: rss,
  };
};

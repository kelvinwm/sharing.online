const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4400;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const isCrawler = (userAgent = "") => {
  const crawlers = [
    "facebookexternalhit", // Facebook
    "Twitterbot",          // Twitter
    "WhatsApp",            // WhatsApp
    "Slackbot",            // Slack
    "LinkedInBot",         // LinkedIn
    "TelegramBot",         // Telegram
    "Googlebot"            // Google (optional)
  ];
  return crawlers.some(crawler => userAgent.includes(crawler));
};

app.get("/:slug", async (req, res) => {
  const ua = req.headers["user-agent"] || "";
  const slug = req.params.slug;

  if (isCrawler(ua)) {
    let book = await getBookBySlug(slug); // your DB call

    if (!book) {
      // 🔥 fallback OG meta when book not found
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>ShareMyBook - Discover Great Reads</title>

          <!-- Open Graph fallback -->
          <meta property="og:title" content="Discover Amazing Books on ShareMyBook" />
          <meta property="og:description" content="Browse, share, and explore great reads with ShareMyBook. Find both free and paid books in one place." />
          <meta property="og:image" content="https://sharemybook.online/default-cover.jpg" />
          <meta property="og:url" content="https://sharemybook.online" />
          <meta property="og:type" content="website" />

          <!-- Twitter fallback -->
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Discover Amazing Books on ShareMyBook" />
          <meta name="twitter:description" content="Browse, share, and explore great reads with ShareMyBook. Find both free and paid books in one place." />
          <meta name="twitter:image" content="https://sharemybook.online/default-cover.jpg" />
        </head>
        <body>
          <p>Default preview for crawlers when book not found.</p>
        </body>
        </html>
      `);
    }

    // ✅ Book found — serve meta
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${book.name}</title>

        <!-- Open Graph -->
        <meta property="og:title" content="${book.name}" />
        <meta property="og:description" content="By ${book.author?.[0]?.name || "Unknown"} · 
        Price: ${book.discountedPrice && book.discountedPrice > 0
          ? `${book.currency} ${book.price} → Now ${book.currency} ${book.discountedPrice}`
          : `${book.currency} ${book.price}`} 
        ${book.averageRating > 0 ? ` · Rating: ${book.averageRating}/5 ⭐` : ""} 
        — ${book.description.replace(/<[^>]+>/g, "").substring(0, 200)}" />
        <meta property="og:image" content="${book.image || "https://sharemybook.online/default-cover.jpg"}" />
        <meta property="og:url" content="https://sharemybook.online/${book.slug}" />
        <meta property="og:type" content="book" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${book.name}" />
        <meta name="twitter:description" content="By ${book.author?.[0]?.name || "Unknown"} · 
        Price: ${book.discountedPrice && book.discountedPrice > 0
          ? `${book.currency} ${book.price} → Now ${book.currency} ${book.discountedPrice}`
          : `${book.currency} ${book.price}`} 
        ${book.averageRating > 0 ? ` · Rating: ${book.averageRating}/5 ⭐` : ""} 
        — ${book.description.replace(/<[^>]+>/g, "").substring(0, 200)}" />
        <meta name="twitter:image" content="${book.image || "https://sharemybook.online/default-cover.jpg"}" />
      </head>
      <body>
        <p>Book preview for crawlers.</p>
      </body>
      </html>
    `);
  }

  // 🚀 Normal user — redirect to Netlify
  res.redirect(301, `https://hlpbooks.netlify.app/books/${slug}`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

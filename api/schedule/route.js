import { runScan } from "../scan/route";
import { Resend } from "resend";
import { buildEmailHtml } from "../send-email/template";

const resend = new Resend(process.env.RESEND_API_KEY);

// Store subscribers in env var as JSON string, or use a DB in production
// Format: SUBSCRIBERS=[{"email":"x@x.com","sector":"Arts","region":"Australia"}]
function getSubscribers() {
  try {
    return JSON.parse(process.env.SUBSCRIBERS || "[]");
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  // Verify this is a legitimate Vercel cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const subscribers = getSubscribers();

  if (subscribers.length === 0) {
    return res.status(200).json({ message: "No subscribers to process" });
  }

  const date = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const results = [];

  for (const subscriber of subscribers) {
    try {
      // Run Claude scan for this subscriber's preferences
      const scanData = await runScan({
        sector: subscriber.sector,
        region: subscriber.region,
        type: subscriber.type || null,
      });

      const html = buildEmailHtml({
        opportunities: scanData.opportunities || [],
        sector: subscriber.sector,
        region: subscriber.region,
        note: scanData.note,
        date,
      });

      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "OpportunityScanner <scanner@yourdomain.com>",
        to: [subscriber.email],
        subject: `${(scanData.opportunities || []).length} website project opportunities · ${subscriber.sector}${subscriber.region ? ` / ${subscriber.region}` : ""} · ${date}`,
        html,
      });

      results.push({
        email: subscriber.email,
        success: !error,
        count: (scanData.opportunities || []).length,
        error: error?.message,
      });
    } catch (err) {
      results.push({ email: subscriber.email, success: false, error: err.message });
    }
  }

  return res.status(200).json({ processed: results.length, results });
}

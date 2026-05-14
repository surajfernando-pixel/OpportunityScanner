import { Resend } from "resend";
import { buildEmailHtml } from "./template";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, opportunities, sector, region, note } = req.body;

  if (!to || !opportunities) {
    return res.status(400).json({ error: "Email address and opportunities are required" });
  }

  const date = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  try {
    const html = buildEmailHtml({ opportunities, sector, region, note, date });

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "OpportunityScanner <scanner@yourdomain.com>",
      to: [to],
      subject: `${opportunities.length} website project opportunities · ${sector}${region ? ` / ${region}` : ""} · ${date}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: "Failed to send email", details: error });
    }

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}

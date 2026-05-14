import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a specialist procurement researcher helping a digital web agency find website design and redevelopment tender opportunities.

ONLY return opportunities specifically for:
- Website redesign or redevelopment
- New website builds
- CMS migration or platform change (WordPress, Drupal, Craft CMS etc.)
- Website UX/UI redesign
- Website accessibility upgrades (WCAG)
- Intranet or extranet website builds

EXCLUDE completely:
- Mobile apps or native applications
- Software development or platforms
- IT infrastructure, hosting, cloud services
- Digital marketing campaigns or SEO retainers
- Social media management
- Video production or animation
- Data or analytics platforms
- ERP, CRM, or back-office systems

Return ONLY valid JSON with no markdown, no backticks, no explanation:
{
  "opportunities": [
    {
      "organisation": "string",
      "location": "City, Country",
      "website": "https://...",
      "tender_link": "https://... or null",
      "project_scope": "One sentence describing the website project",
      "contact_name": "Name or Not specified",
      "contact_title": "Job title",
      "published": "DD Mon YYYY or Not specified",
      "due_date": "DD Mon YYYY or Not specified",
      "status": "Open | Closing Soon | New | Closed",
      "type": "RFP | Tender | EOI | Brief | RFQ"
    }
  ],
  "note": "One sentence about data quality"
}

Rules:
- Use real organisations that genuinely exist
- Every result must be a website design/build project — no exceptions
- Vary status: mix of Open, New, Closing Soon
- Due dates should be realistic future dates`;

export async function runScan({ sector, region, type }) {
  let prompt = `Find 10 website design and redevelopment tender opportunities in the ${sector} sector`;
  if (region) prompt += ` in ${region}`;
  if (type) prompt += `. Focus on ${type} opportunity type`;
  prompt += `. Today's date is ${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}. Only return website build/redesign projects.`;

  // Check API key is present before attempting call
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing. Add it to your .env.local file and restart the server.");
  }

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    // Surface Anthropic API errors clearly
    const detail = err?.message || "Unknown API error";
    throw new Error(`Claude API error: ${detail}`);
  }

  const raw = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  if (!raw) {
    throw new Error("Claude returned an empty response. Check your API key and account credits.");
  }

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Could not parse Claude response as JSON. Raw response: ${cleaned.slice(0, 200)}`);
  }

  return parsed;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sector, region, type } = req.body;

  if (!sector) {
    return res.status(400).json({ error: "Sector is required" });
  }

  try {
    const data = await runScan({ sector, region, type });
    return res.status(200).json(data);
  } catch (err) {
    console.error("Scan error:", err.message);
    return res.status(500).json({ error: err.message || "Scan failed. Please try again." });
  }
}

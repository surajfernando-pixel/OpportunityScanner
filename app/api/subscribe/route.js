// In production, store subscribers in a database (Supabase, PlanetScale etc.)
// For simplicity, this route returns instructions on how to add to env var
// You can extend this to use any DB you prefer

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, sector, region, type } = req.body;

  if (!email || !sector) {
    return res.status(400).json({ error: "Email and sector are required" });
  }

  // Parse existing subscribers
  let subscribers = [];
  try {
    subscribers = JSON.parse(process.env.SUBSCRIBERS || "[]");
  } catch {
    subscribers = [];
  }

  // Check if already subscribed
  const exists = subscribers.find((s) => s.email === email && s.sector === sector);
  if (exists) {
    return res.status(200).json({
      success: true,
      message: "Already subscribed with these preferences",
      subscriber: exists,
    });
  }

  const newSubscriber = { email, sector, region: region || null, type: type || null };

  // In production: save to DB here
  // For now: return the new subscriber config for manual env var update
  subscribers.push(newSubscriber);

  return res.status(200).json({
    success: true,
    message: "Subscription saved. Update your SUBSCRIBERS env var in Vercel with the value below.",
    subscriber: newSubscriber,
    env_value: JSON.stringify(subscribers),
    instructions: "Go to Vercel dashboard → Settings → Environment Variables → update SUBSCRIBERS with the env_value above, then redeploy.",
  });
}

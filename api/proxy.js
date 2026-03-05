export default async function handler(req, res) {
  const SCRAPER_URL = process.env.SCRAPER_URL || "https://full-scraper-yain.onrender.com";
  const API_KEY = process.env.SCRAPER_API_KEY || "";
  const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "admin";

  const authHeader = req.headers["x-dashboard-auth"] || "";
  if (authHeader !== DASHBOARD_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const captured = req.query.__path || "";
  const remotePath = "/" + captured;
  const query = { ...req.query };
  delete query.__path;
  const qs = Object.keys(query).length
    ? "?" + new URLSearchParams(query).toString()
    : "";
  const target = SCRAPER_URL.replace(/\/+$/, "") + remotePath + qs;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const body = await upstream.text();

    res.setHeader("Content-Type", contentType);
    const cd = upstream.headers.get("content-disposition");
    if (cd) res.setHeader("Content-Disposition", cd);

    return res.status(upstream.status).send(body);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}

// Proxy: Vercel dashboard → full_scraper on Render (dashboard password + server-side API key).

function readRequestBody(req) {
  if (req.method === "GET" || req.method === "HEAD") {
    return Promise.resolve(undefined);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (!chunks.length) {
        resolve(undefined);
        return;
      }
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  const SCRAPER_URL = (process.env.SCRAPER_URL || "https://full-scraper-yain.onrender.com").replace(
    /\/+$/,
    "",
  );
  const API_KEY = process.env.SCRAPER_API_KEY || "";
  const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "";

  if (!DASHBOARD_PASSWORD) {
    return res.status(500).json({
      error: "DASHBOARD_PASSWORD is not set in Vercel environment variables.",
    });
  }
  if (!API_KEY) {
    return res.status(500).json({
      error: "SCRAPER_API_KEY is not set (Render API_KEY for upstream Bearer auth).",
    });
  }

  const authHeader = req.headers["x-dashboard-auth"] || "";
  if (authHeader !== DASHBOARD_PASSWORD) {
    res.setHeader("X-Proxy-Auth", "dashboard");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const captured = req.query.__path || "";
  const remotePath = "/" + captured;
  const query = { ...req.query };
  delete query.__path;
  const qs = Object.keys(query).length
    ? "?" + new URLSearchParams(query).toString()
    : "";
  const target = SCRAPER_URL + remotePath + qs;

  let body;
  try {
    body = await readRequestBody(req);
  } catch {
    return res.status(400).json({ error: "Could not read request body" });
  }

  const upstreamHeaders = {
    Authorization: `Bearer ${API_KEY}`,
  };
  const ct = req.headers["content-type"];
  if (ct) upstreamHeaders["Content-Type"] = ct;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: upstreamHeaders,
      body: body && body.length ? body : undefined,
    });

    const contentType = upstream.headers.get("content-type") || "application/json";
    const outBody = Buffer.from(await upstream.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    const cd = upstream.headers.get("content-disposition");
    if (cd) res.setHeader("Content-Disposition", cd);

    return res.status(upstream.status).send(outBody);
  } catch (err) {
    return res.status(502).json({ error: err.message || "Upstream fetch failed" });
  }
}

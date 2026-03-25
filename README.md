# full-scraper-dashboard

Static dashboard for [**full_scraper**](https://github.com/Jakeminator123/full_scraper), hosted on **Vercel**. All API calls go through [`api/proxy.js`](api/proxy.js) so the **Render `API_KEY` never reaches the browser**.

Live: [full-scraper-dashboard.vercel.app](https://full-scraper-dashboard.vercel.app)

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Required | Description |
|----------|----------|-------------|
| `SCRAPER_API_KEY` | **Yes** | Same value as `API_KEY` on Render (Bearer token for upstream). |
| `DASHBOARD_PASSWORD` | **Yes** | Shared secret; user enters this on the login screen (`x-dashboard-auth` header). Pick a strong password. |
| `SCRAPER_URL` | No | Default `https://full-scraper-yain.onrender.com` if unset. |

**Breaking change (security):** Older commits used a hardcoded default password. You **must** set `DASHBOARD_PASSWORD` explicitly after upgrading.

## Source of truth

`index.html` is kept in sync with `dashboard.html` in the **full_scraper** repo. After changing the UI, copy from there or commit both repos.

## Local test with proxy behaviour

Run a static server from this directory and open:

`http://localhost:8080?proxy=1`

Then the same `index.html` uses `/api/...` paths (you still need Vercel’s serverless proxy locally — use `vercel dev`, or test on the deployed Vercel preview).

## Alerts

See [full_scraper/docs/ALERTS.md](https://github.com/Jakeminator123/full_scraper/blob/main/docs/ALERTS.md) for Render/Vercel notifications and uptime checks.

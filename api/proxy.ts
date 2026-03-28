import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "";
const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const path = (req.url || "").replace(/^\/api\/proxy/, "") || "/";
  const targetUrl = `${API_GATEWAY_URL}${path}`;

  console.log(`[proxy] ${req.method} ${targetUrl}`);
  console.log(`[proxy] API_GATEWAY_URL=${API_GATEWAY_URL ? "set" : "MISSING"}`);
  console.log(`[proxy] API_GATEWAY_KEY=${API_GATEWAY_KEY ? "set" : "MISSING"}`);

  if (!API_GATEWAY_URL) {
    return res.status(500).json({ error: "API_GATEWAY_URL not configured" });
  }

  const headers: Record<string, string> = {
    "x-api-key": API_GATEWAY_KEY,
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();
    console.log(`[proxy] response status=${response.status} body=${text.slice(0, 200)}`);

    try {
      const data = JSON.parse(text);
      res.status(response.status).json(data);
    } catch {
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error(`[proxy] fetch error:`, error);
    res.status(502).json({ error: "Failed to reach API", detail: String(error) });
  }
}

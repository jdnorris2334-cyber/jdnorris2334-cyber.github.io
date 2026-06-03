// netlify/functions/ebay-proxy.js
// Place this file at: netlify/functions/ebay-proxy.js in your repo

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { action, clientId, clientSecret, query, appToken } = body;

  // ── Get App Token ──────────────────────────────────────────────────────────
  if (action === "get_token") {
    if (!clientId || !clientSecret) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing credentials" }) };
    }
    try {
      const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${creds}`,
        },
        body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          statusCode: res.status,
          headers,
          body: JSON.stringify({ error: data.error || "auth_failed", detail: data }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "network_error", message: err.message }) };
    }
  }

  // ── Search eBay Sold Listings ──────────────────────────────────────────────
  if (action === "search") {
    if (!appToken || !query) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing appToken or query" }) };
    }
    try {
      const params = new URLSearchParams({
        q: query,
        limit: "200",
        filter: "buyingOptions:{FIXED_PRICE|AUCTION},deliveryCountry:US",
        sort: "endingSoonest",
      });
      const res = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`, {
        headers: {
          "Authorization": `Bearer ${appToken}`,
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          statusCode: res.status,
          headers,
          body: JSON.stringify({ error: "search_failed", detail: data }),
        };
      }
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "network_error", message: err.message }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
};

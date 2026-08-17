export default async function handler(req, res) {
  try {
    const host = process.env.XTREAM_HOST;
    const username = process.env.XTREAM_USERNAME;
    const password = process.env.XTREAM_PASSWORD;

    if (!host || !username || !password) {
      return res.status(500).json({
        error: "Missing Xtream environment variables"
      });
    }

    const params = new URLSearchParams(req.query);

    const action = params.get("action");

    const url = new URL("/player_api.php", host);
    url.searchParams.set("username", username);
    url.searchParams.set("password", password);

    if (action) {
      url.searchParams.set("action", action);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Xtream returned ${response.status}`
      });
    }

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    console.error("IPTV API error:", error);

    return res.status(500).json({
      error: "Could not connect to IPTV server"
    });
  }
}

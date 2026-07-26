const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

function siteOrigin(req) {
	const host = req.headers.host || "";
	const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
	return `${protocol}://${host}`;
}

function renderMessage(resultWord, payload) {
	// Protokol handshake postMessage yang diharapkan Decap CMS:
	// "authorization:github:success:<json>" atau "authorization:github:error:<message>"
	return `<!DOCTYPE html><html><body>
<script>
(function() {
  function receiveMessage(message) {
    window.opener.postMessage(
      'authorization:github:${resultWord}:${payload}',
      message.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;
}

export default async function handler(req, res) {
	const { code, state } = req.query;
	const cookieState = req.cookies?.decap_oauth_state;

	if (!code || !state || state !== cookieState) {
		res.status(400).send("Invalid OAuth state or missing authorization code.");
		return;
	}

	const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
	const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		res.status(500).send("Missing OAUTH_GITHUB_CLIENT_ID/OAUTH_GITHUB_CLIENT_SECRET env vars");
		return;
	}

	const tokenRes = await fetch(GITHUB_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json", Accept: "application/json" },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: `${siteOrigin(req)}/api/callback`,
		}),
	});
	const data = await tokenRes.json();

	res.setHeader("Content-Type", "text/html");
	res.setHeader("Set-Cookie", "decap_oauth_state=; HttpOnly; Path=/; Max-Age=0");

	if (!data.access_token) {
		res.status(400).send(`OAuth error: ${data.error_description || "unknown error"}`);
		return;
	}

	const payload = JSON.stringify({ token: data.access_token, provider: "github" });
	res.status(200).send(renderMessage("success", payload));
}

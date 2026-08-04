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
  function receiveMessage(e) {
    try {
      window.opener.postMessage(
        'authorization:github:${resultWord}:${payload}',
        '*'
      );
    } catch(err) {
      console.error(err);
    }
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  }
})();
</script>
</body></html>`;
}

function getCookie(req, name) {
	if (req.cookies?.[name]) return req.cookies[name];
	const cookieHeader = req.headers?.cookie || "";
	const match = cookieHeader.match(new RegExp(`(?:^|; )\\s*${name}\\s*=\\s*([^;]+)`));
	return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req, res) {
	const { code, state } = req.query;
	const cookieState = getCookie(req, "decap_oauth_state");

	res.setHeader("Content-Type", "text/html");

	if (!code || !state || state !== cookieState) {
		const errMsg = "Invalid OAuth state or missing authorization code.";
		res.status(400).send(renderMessage("error", JSON.stringify(errMsg)));
		return;
	}

	const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
	const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		const errMsg = "Missing OAUTH_GITHUB_CLIENT_ID/OAUTH_GITHUB_CLIENT_SECRET env vars on Vercel.";
		res.status(500).send(renderMessage("error", JSON.stringify(errMsg)));
		return;
	}

	try {
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

		res.setHeader("Set-Cookie", "decap_oauth_state=; HttpOnly; Path=/; Max-Age=0");

		if (!data.access_token) {
			const errMsg = data.error_description || "OAuth error from GitHub";
			res.status(400).send(renderMessage("error", JSON.stringify(errMsg)));
			return;
		}

		const payload = JSON.stringify({ token: data.access_token, provider: "github" });
		res.status(200).send(renderMessage("success", payload));
	} catch (err) {
		res.status(500).send(renderMessage("error", JSON.stringify(err.message)));
	}
}

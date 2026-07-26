import crypto from "node:crypto";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";

function siteOrigin(req) {
	const host = req.headers.host || "";
	const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
	return `${protocol}://${host}`;
}

export default function handler(req, res) {
	const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
	if (!clientId) {
		res.status(500).send("Missing OAUTH_GITHUB_CLIENT_ID environment variable");
		return;
	}

	const state = crypto.randomBytes(16).toString("hex");
	const redirectUri = `${siteOrigin(req)}/api/callback`;

	res.setHeader(
		"Set-Cookie",
		`decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
	);

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: "repo,user",
		state,
	});

	res.writeHead(302, { Location: `${GITHUB_AUTH_URL}?${params.toString()}` });
	res.end();
}

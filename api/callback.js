const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

function siteOrigin(req) {
	const host = req.headers.host || "";
	const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
	return `${protocol}://${host}`;
}

function renderMessage(resultWord, payload) {
	const payloadEscaped = JSON.stringify(payload);

	return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Decap CMS - Auth Callback Debug Terminal</title>
  <style>
    body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 1.5rem;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #334155;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }
    .title { font-weight: 700; font-size: 14px; color: #38bdf8; }
    .status-badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
    }
    .status-success { background: #15803d; color: #dcfce7; }
    .status-error { background: #b91c1c; color: #fef2f2; }
    .log-box {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1.25rem;
      max-height: 220px;
      overflow-y: auto;
    }
    .log-entry { margin-bottom: 4px; word-break: break-all; }
    .log-info { color: #94a3b8; }
    .log-send { color: #38bdf8; }
    .log-success { color: #4ade80; font-weight: 700; }
    .log-warn { color: #fbbf24; }
    .log-error { color: #f87171; font-weight: 700; }
    .token-box {
      background: #020617;
      border: 1px dashed #475569;
      padding: 0.75rem;
      border-radius: 6px;
      word-break: break-all;
      margin-bottom: 1rem;
      font-size: 12px;
      color: #38bdf8;
    }
    .btn {
      background: #0284c7;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
    }
    .btn:hover { background: #0369a1; }
    .btn-secondary { background: #475569; margin-left: 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">⚡ Decap CMS Auth Debug Terminal</span>
    <span class="status-badge status-${resultWord === 'success' ? 'success' : 'error'}">${resultWord}</span>
  </div>

  <div class="log-box" id="log"></div>

  <div id="manual-area" style="display:none;">
    <div style="color: #fbbf24; margin-bottom: 0.5rem; font-weight: 700;">
      ⚠️ Jika jendela ini tidak menutup otomatis (karena mode Private / Cross-Origin policy):
    </div>
    <div class="token-box" id="token-val">Tutup dan coba lagi.</div>
    <button class="btn" onclick="copyToken()">📋 Salin Token Autentikasi</button>
    <button class="btn btn-secondary" onclick="window.close()">❌ Tutup Jendela</button>
  </div>

  <script>
    (function() {
      const resultWord = "${resultWord}";
      const rawPayload = ${payloadEscaped};
      const logEl = document.getElementById('log');

      function appendLog(msg, type) {
        const div = document.createElement('div');
        div.className = 'log-entry log-' + (type || 'info');
        const time = new Date().toLocaleTimeString();
        div.innerText = '[' + time + '] ' + msg;
        logEl.appendChild(div);
        logEl.scrollTop = logEl.scrollHeight;
      }

      appendLog('Callback diproses: Result = ' + resultWord, 'info');

      let tokenString = '';
      try {
        const parsed = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
        if (parsed && parsed.token) {
          tokenString = parsed.token;
          document.getElementById('token-val').innerText = tokenString;
        }
      } catch(e) {}

      if (resultWord === 'error') {
        appendLog('ERROR: ' + JSON.stringify(rawPayload), 'error');
        document.getElementById('manual-area').style.display = 'block';
        return;
      }

      function sendHandshake() {
        if (!window.opener) {
          appendLog('CRITICAL: window.opener tidak ditemukan / terisolasi oleh peramban.', 'error');
          document.getElementById('manual-area').style.display = 'block';
          return false;
        }

        try {
          appendLog('Mengirim sinyal authorizing:github ke window.opener...', 'send');
          window.opener.postMessage('authorizing:github', '*');

          appendLog('Mengirim sinyal authorization:github:success ke window.opener...', 'send');
          window.opener.postMessage('authorization:github:success:' + rawPayload, '*');
          return true;
        } catch(err) {
          appendLog('Gagal postMessage: ' + err.message, 'error');
          document.getElementById('manual-area').style.display = 'block';
          return false;
        }
      }

      const success = sendHandshake();

      if (success) {
        let attempts = 0;
        const timer = setInterval(() => {
          attempts++;
          appendLog('Pengulangan sinyal retry #' + attempts + '/10...', 'warn');
          sendHandshake();
          if (attempts >= 10) {
            clearInterval(timer);
            appendLog('Penjaminan sinyal selesai. Jika jendela belum menutup, gunakan tombol salin token.', 'info');
            document.getElementById('manual-area').style.display = 'block';
          }
        }, 400);
      }

      window.copyToken = function() {
        if (tokenString) {
          navigator.clipboard.writeText(tokenString).then(() => {
            alert('Token berhasil disalin! Tempelkan token ini di panel debug jendela utama CMS.');
          }).catch(() => {
            alert('Token: ' + tokenString);
          });
        }
      };
    })();
  </script>
</body>
</html>`;
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

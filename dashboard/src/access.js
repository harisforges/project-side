// Verifies the Cloudflare Access JWT (Cf-Access-Jwt-Assertion) so the Worker fails closed
// even if someone reaches it without passing through Access.
// Env: ACCESS_TEAM_DOMAIN (e.g. https://takusut.cloudflareaccess.com), ACCESS_AUD (application audience tag).
// Local dev only: DEV_NO_AUTH = "true" (set in .dev.vars, never in production).

let certCache = { at: 0, keys: [] };

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function getKeys(teamDomain) {
  if (Date.now() - certCache.at < 3600000 && certCache.keys.length) return certCache.keys;
  const res = await fetch(`${teamDomain.replace(/\/$/, '')}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error('certs fetch failed');
  const { keys } = await res.json();
  certCache = { at: Date.now(), keys };
  return keys;
}

export async function checkAccess(request, env) {
  if (env.DEV_NO_AUTH === 'true') return { ok: true, email: 'dev@local' };
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return { ok: false, reason: 'Access not configured (set ACCESS_TEAM_DOMAIN and ACCESS_AUD).' };
  const token = request.headers.get('Cf-Access-Jwt-Assertion') ||
    (request.headers.get('Cookie') || '').match(/CF_Authorization=([^;]+)/)?.[1];
  if (!token) return { ok: false, reason: 'No Access token.' };
  try {
    const [h, p, sig] = token.split('.');
    const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(h)));
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(p)));
    const keys = await getKeys(env.ACCESS_TEAM_DOMAIN);
    const jwk = keys.find((k) => k.kid === header.kid);
    if (!jwk) return { ok: false, reason: 'Unknown key.' };
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64urlToBytes(sig), new TextEncoder().encode(`${h}.${p}`));
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    const now = Math.floor(Date.now() / 1000);
    if (!valid || !aud.includes(env.ACCESS_AUD) || payload.exp < now) return { ok: false, reason: 'Invalid token.' };
    return { ok: true, email: payload.email };
  } catch (e) {
    return { ok: false, reason: 'Token check failed.' };
  }
}

/**
 * The admin session cookie: a signed, expiring token.
 *
 * It used to be the literal string "authenticated" - unsigned, so anyone could
 * set it by hand and walk into the dashboard. Now that the dashboard can
 * rewrite the entire website, the cookie is `v1.<expiry>.<HMAC-SHA256>` and the
 * proxy checks the signature and the expiry on every admin request.
 *
 * Web Crypto only, so this runs unchanged in the proxy and in route handlers.
 *
 * The signing secret is ADMIN_SESSION_SECRET if set. Otherwise it is derived
 * from the admin password and the service key, which means (a) an existing
 * deployment keeps working with no new variable, and (b) changing the admin
 * password signs everyone out - the behaviour you want after a password leak.
 */

/* `__Host-` in production: the browser then refuses the cookie unless it is
   Secure, host-only and path=/, so no other subdomain (or a page served over
   plain http) can plant or overwrite a session. Plain http on localhost in
   development cannot carry a Secure cookie, hence the second name. */
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-khao_san_admin' : 'khao_san_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // one week

const enc = new TextEncoder();

function secretMaterial(): string | null {
    const explicit = process.env.ADMIN_SESSION_SECRET;
    if (explicit && explicit.length >= 16) return explicit;
    const pw = process.env.ADMIN_PASSWORD;
    const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return pw && svc ? `khao-san-admin:${pw}:${svc}` : null;
}

async function hmacKey(): Promise<CryptoKey | null> {
    const material = secretMaterial();
    if (!material) return null;
    return crypto.subtle.importKey('raw', enc.encode(material), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

const b64url = (buf: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function fromB64url(s: string): Uint8Array<ArrayBuffer> | null {
    try {
        const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    } catch {
        return null;
    }
}

export async function createSessionToken(): Promise<string | null> {
    const key = await hmacKey();
    if (!key) return null;
    const payload = `v1.${Math.floor(Date.now() / 1000) + SESSION_MAX_AGE}`;
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    return `${payload}.${b64url(sig)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'v1') return false;
    const exp = Number(parts[1]);
    if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
    const sig = fromB64url(parts[2]);
    const key = await hmacKey();
    if (!sig || !key) return false;
    // subtle.verify compares in constant time.
    return crypto.subtle.verify('HMAC', key, sig, enc.encode(`${parts[0]}.${parts[1]}`));
}

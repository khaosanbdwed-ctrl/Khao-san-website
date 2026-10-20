import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Admin session: one shared login, held in a signed, expiring cookie.
 *
 * ⚠ The cookie used to carry the literal string "authenticated", and the proxy
 * accepted any request carrying it - so anyone could set that cookie in their
 * own browser and walk into the admin. It is now an HMAC-signed token with an
 * expiry, and nothing without the server's secret can produce a valid one.
 *
 * The signing secret is ADMIN_SESSION_SECRET when set (32+ characters).
 * Otherwise it is derived from ADMIN_PASSWORD and SUPABASE_SERVICE_ROLE_KEY,
 * which are both server-only secrets already - so no extra setup is needed,
 * and CHANGING THE ADMIN PASSWORD SIGNS EVERYONE OUT, which is what you want
 * after a password leak.
 */
export const SESSION_COOKIE = 'khao_san_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function secret(): string | null {
    const explicit = process.env.ADMIN_SESSION_SECRET;
    if (explicit && explicit.length >= 32) return explicit;
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return null;
    return createHash('sha256')
        .update(`khaosan-admin-session|${password}|${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`)
        .digest('hex');
}

const sign = (payload: string, key: string) => createHmac('sha256', key).update(payload).digest('base64url');

export function createSessionToken(now = Date.now()): string | null {
    const key = secret();
    if (!key) return null;
    const payload = Buffer.from(JSON.stringify({ v: 1, exp: Math.floor(now / 1000) + SESSION_MAX_AGE })).toString('base64url');
    return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token: string | undefined | null, now = Date.now()): boolean {
    const key = secret();
    if (!key || !token) return false;
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = Buffer.from(sign(payload, key));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
    try {
        const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
        return typeof exp === 'number' && exp * 1000 > now;
    } catch {
        return false;
    }
}

/** Constant-time comparison of the submitted login against the environment. */
export function checkCredentials(username: unknown, password: unknown): boolean {
    const expectedUser = process.env.ADMIN_USERNAME;
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedUser || !expectedPass) return false;
    if (typeof username !== 'string' || typeof password !== 'string') return false;
    const digest = (s: string) => createHash('sha256').update(s).digest();
    const userOk = timingSafeEqual(digest(username), digest(expectedUser));
    const passOk = timingSafeEqual(digest(password), digest(expectedPass));
    return userOk && passOk;
}

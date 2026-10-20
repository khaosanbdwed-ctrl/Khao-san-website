/**
 * fetch() for the admin API: JSON in, JSON out, and the server's own error
 * message surfaced as the thrown Error. An expired session sends the editor
 * back to the login page instead of failing silently.
 */
export class ApiError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

export async function api<T = unknown>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const res = await fetch(url, {
        method: init.method ?? 'GET',
        headers: init.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        cache: 'no-store',
    });
    let payload: unknown = null;
    try { payload = await res.json(); } catch { /* empty body */ }
    if (res.status === 401 && typeof window !== 'undefined') {
        window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    if (!res.ok) {
        const message = (payload as { error?: string } | null)?.error ?? `Request failed (${res.status}).`;
        throw new ApiError(message, res.status);
    }
    return payload as T;
}

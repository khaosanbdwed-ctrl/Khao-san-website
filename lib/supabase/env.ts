/**
 * Required-environment accessor for the Supabase clients.
 *
 * All three clients used `process.env.X!`. The non-null assertion satisfies
 * TypeScript and does nothing at runtime, so a missing variable travelled as
 * `undefined` into supabase-js and surfaced as:
 *
 *     Error: supabaseUrl is required.
 *
 * during `next build`, attributed to whichever page happened to prerender
 * first (`/menu`, because it is ISR and gets prerendered at build time). That
 * message names neither the variable nor the fact that it is a deployment
 * configuration problem rather than a code one.
 *
 * Failing here instead names the exact variable and says where to set it. It
 * deliberately still throws: a menu that silently builds with no dishes is a
 * worse outcome than a build that stops.
 */
const REQUIRED = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
] as const;

/**
 * Names (never values) of the Supabase/admin variables the process can
 * actually see. Printed on failure because the usual causes are invisible from
 * the error alone: a typo in the key, a variable scoped to Production while a
 * Preview build runs, or the variable added to the wrong project. Seeing
 * `SUPABASE_URL` in this list next to a complaint about
 * `NEXT_PUBLIC_SUPABASE_URL` identifies the problem instantly.
 *
 * Names only. Values are secrets and are never logged.
 */
function visibleKeys(): string {
    const keys = Object.keys(process.env)
        .filter(k => /SUPABASE|ADMIN_/i.test(k))
        .sort()
        // Defined-but-empty is its own failure mode - a variable saved in the
        // dashboard with a blank value looks "set" in the UI and reads as
        // missing here. Annotate it so the two cases are distinguishable.
        .map(k => (process.env[k] ? k : `${k} (SET BUT EMPTY)`));
    return keys.length ? keys.join(', ') : '(none)';
}

export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        const missing = REQUIRED.filter(k => !process.env[k]);
        throw new Error(
            `Missing required environment variable ${name}.\n\n` +
            `Missing (all of these must be set): ${missing.join(', ')}\n` +
            `Supabase/admin variables this build CAN see: ${visibleKeys()}\n\n` +
            `Supabase configuration lives in .env.local, which is gitignored, so it is ` +
            `NOT present on a deploy host. See .env.example for the full list.\n\n` +
            `On Vercel, if you have already added them and this still fails, check:\n` +
            `  1. The variable is enabled for THIS environment. A Preview or branch ` +
            `deploy does not inherit Production-only variables.\n` +
            `  2. You redeployed AFTER saving them. Environment changes do not apply ` +
            `to an already-running or cached build - trigger a new deployment, and ` +
            `untick "Use existing build cache" if you redeploy an old commit.\n` +
            `  3. The name matches exactly, including the NEXT_PUBLIC_ prefix and with ` +
            `no trailing space (compare against the visible list above).\n` +
            `  4. You are looking at the right Vercel project.`
        );
    }
    return value;
}

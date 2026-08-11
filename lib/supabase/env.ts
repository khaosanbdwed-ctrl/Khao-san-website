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
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `Missing required environment variable ${name}.\n` +
            `Supabase configuration lives in .env.local, which is gitignored, so it is ` +
            `NOT present on a deploy host. Set ${name} in the hosting platform's ` +
            `environment variables (for Vercel: Project -> Settings -> Environment ` +
            `Variables, for Production, Preview and Development), then redeploy. ` +
            `See .env.example for the full list.`
        );
    }
    return value;
}

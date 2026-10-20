import HomePage from '@/components/home-page';
import { getSiteContent } from '@/lib/cms/content';
import { toLocations } from '@/lib/locations';

/**
 * The homepage renders from the CMS. It is static and cached; Publish in the
 * dashboard refreshes it immediately (revalidatePath in lib/cms/store.ts), so
 * the hour is only a backstop for edits made directly in Supabase.
 */
export const revalidate = 3600;

export default async function Home() {
    const site = await getSiteContent();
    return (
        <HomePage
            content={site.home}
            locations={toLocations(site.locations)}
            whatsapp={site.locations.general.primaryWhatsapp}
        />
    );
}

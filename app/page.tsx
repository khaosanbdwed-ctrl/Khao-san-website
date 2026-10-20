import HomeSections from '@/components/cms/home-sections';

/**
 * The homepage is built entirely from the CMS: Admin -> Homepage controls
 * which sections appear, in what order, and everything inside them.
 *
 * The seven original chapters (hero, craft, heritage + signature dishes,
 * locations, gift, closing) are the default content in lib/cms/schema.ts,
 * and their markup lives in components/cms/sections/ with the design notes
 * that used to sit in this file.
 */
export default function Home() {
    return <HomeSections />;
}

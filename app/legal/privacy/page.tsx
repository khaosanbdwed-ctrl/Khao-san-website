import type { Metadata } from 'next';
import LegalPage from '@/components/legal-page';
import { getSiteContent } from '@/lib/cms/content';

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteContent();
  return { title: `${legal.privacy.title} | Khao San`, description: legal.privacy.metaDescription };
}

export default async function Page() {
  const { legal } = await getSiteContent();
  return <LegalPage page={legal.privacy} />;
}

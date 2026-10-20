import type { Metadata } from 'next';
import LegalPage from '@/components/legal-page';
import { getSiteContent } from '@/lib/cms/content';

export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSiteContent();
  return { title: `${legal.terms.title} | Khao San`, description: legal.terms.metaDescription };
}

export default async function Page() {
  const { legal } = await getSiteContent();
  return <LegalPage page={legal.terms} />;
}

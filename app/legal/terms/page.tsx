import type { Metadata } from 'next';
import LegalView from '@/components/cms/legal-view';
import { getSiteContent } from '@/lib/cms/store';

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSiteContent();
  return { title: content.terms.metaTitle, description: content.terms.metaDescription };
}

export default function TermsPage() {
  return <LegalView doc="terms" />;
}

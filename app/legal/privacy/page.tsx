import type { Metadata } from 'next';
import LegalView from '@/components/cms/legal-view';
import { getSiteContent } from '@/lib/cms/store';

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getSiteContent();
  return { title: content.privacy.metaTitle, description: content.privacy.metaDescription };
}

export default function PrivacyPage() {
  return <LegalView doc="privacy" />;
}

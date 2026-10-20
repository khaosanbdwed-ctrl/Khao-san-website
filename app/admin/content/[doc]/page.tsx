import { notFound } from 'next/navigation';
import DocEditor from '@/components/admin/cms/doc-editor';
import { isDocKey } from '@/lib/cms/registry';

export default async function EditContentPage({ params }: { params: Promise<{ doc: string }> }) {
    const { doc } = await params;
    if (!isDocKey(doc)) notFound();
    return <DocEditor docKey={doc} />;
}

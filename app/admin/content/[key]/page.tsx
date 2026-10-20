import { notFound } from 'next/navigation';
import DocEditor from '@/components/admin/doc-editor';
import { isDocKey } from '@/lib/cms/schema';

export default async function ContentEditorPage({ params }: { params: Promise<{ key: string }> }) {
    const { key } = await params;
    if (!isDocKey(key)) notFound();
    return <DocEditor docKey={key} />;
}

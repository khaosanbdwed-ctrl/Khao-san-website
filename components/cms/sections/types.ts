import type { HomeSection } from '@/lib/cms/schema';

export type SectionOf<T extends HomeSection['type']> = Extract<HomeSection, { type: T }>;

export interface SectionProps<T extends HomeSection['type']> {
    data: SectionOf<T>['data'];
    /** In-page anchor id, e.g. "locations" for /#locations. */
    anchor?: string;
    /** Present only in the editor's preview - lets it scroll to the section. */
    cmsId?: string;
}

/** Spread onto a section's root element. Emits nothing on the public site. */
export const rootAttrs = (anchor?: string, cmsId?: string) => ({
    ...(anchor ? { id: anchor } : {}),
    ...(cmsId ? { 'data-cms-section': cmsId } : {}),
});

/**
 * The field vocabulary of the website CMS.
 *
 * Every editable area of the site is described ONCE, as a list of these field
 * definitions (see lib/cms/docs/). That one description does three jobs, and
 * keeping them in one place is the point:
 *
 *   1. it is what the dashboard renders as a form (components/admin/cms),
 *   2. it is what the server sanitises a save against (`sanitizeFields`), so
 *      a hand-crafted request can only ever store the shapes listed here,
 *   3. it is what fills gaps when stored content predates a field: anything
 *      missing or malformed falls back to the code default, so adding a new
 *      field to a section never breaks a page that was published before it.
 */

export type Option = { value: string; label: string };

interface Base {
    key: string;
    label: string;
    help?: string;
}

export type Field =
    | (Base & { kind: 'text'; multiline?: boolean; rich?: boolean; maxLength?: number; placeholder?: string })
    | (Base & { kind: 'image' })
    | (Base & { kind: 'video' })
    | (Base & { kind: 'color' })
    | (Base & { kind: 'toggle' })
    | (Base & { kind: 'select'; options: Option[]; optionsFrom?: 'menuCategories' })
    | (Base & { kind: 'checks'; options: Option[] })
    | (Base & { kind: 'range'; min: number; max: number; step?: number; unit?: string })
    | (Base & { kind: 'time' })
    | (Base & { kind: 'link' })
    | (Base & { kind: 'background'; allowVideo?: boolean })
    | (Base & { kind: 'group'; fields: Field[] })
    | (Base & {
        kind: 'list';
        fields: Field[];
        /** Singular noun for the "Add ..." button and item headings. */
        itemLabel: string;
        /** Field whose value titles each collapsed item. */
        titleKey?: string;
        newItem: Record<string, unknown>;
        max?: number;
    });

export interface SectionDef {
    key: string;
    title: string;
    description?: string;
    /** Adds a show/hide switch; stored as `visible` on the section. */
    hideable?: boolean;
    fields: Field[];
}

export interface DocDef {
    key: string;
    title: string;
    description: string;
    /** Page the Preview button opens. */
    previewPath: string;
    /** Sections can be reordered; stored as `sectionOrder`. */
    orderable?: boolean;
    sections: SectionDef[];
}

/* ------------------------------------------------------------------ */
/* Shared composite shapes                                            */
/* ------------------------------------------------------------------ */

export interface CmsLink {
    label: string;
    /** `url` - a page on this site or any web address. `whatsapp` - opens a
     *  WhatsApp chat with `message` pre-typed. `phone` - dials `url`. */
    type: 'url' | 'whatsapp' | 'phone';
    url: string;
    message: string;
}

export interface Background {
    /** Every value empty = the section's designed background. */
    color: string;
    image: string;
    video: string;
    poster: string;
    /** 0-100. Opacity of the video over the colour / image beneath it. */
    videoOpacity: number;
    overlayColor: string;
    /** 0-100. A wash over everything, for legibility of text on media. */
    overlayOpacity: number;
    /** Ink scale for the section's text. `auto` keeps the design's own. */
    textTone: 'auto' | 'light' | 'dark';
}

export const EMPTY_BACKGROUND: Background = {
    color: '', image: '', video: '', poster: '',
    videoOpacity: 100, overlayColor: '#000000', overlayOpacity: 0, textTone: 'auto',
};

export const TEXT_TONES: Option[] = [
    { value: 'auto', label: 'Design default' },
    { value: 'light', label: 'Light text (for dark backgrounds)' },
    { value: 'dark', label: 'Dark text (for light backgrounds)' },
];

const LINK_TYPES = ['url', 'whatsapp', 'phone'] as const;

/* ------------------------------------------------------------------ */
/* Value guards                                                        */
/* ------------------------------------------------------------------ */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const isColor = (v: unknown): v is string => typeof v === 'string' && HEX.test(v);

/** Media must be a site path or an http(s) address - never `javascript:`,
 *  `data:` or anything else that could smuggle script into a src. */
export function safeMediaUrl(v: unknown): string {
    if (typeof v !== 'string') return '';
    const s = v.trim();
    if (!s) return '';
    if (s.startsWith('/') && !s.startsWith('//')) return s;
    if (/^https?:\/\/[^\s"'<>]+$/i.test(s)) return s;
    return '';
}

/** Links may additionally be in-page anchors, mailto: and tel:. */
export function safeHref(v: unknown): string {
    if (typeof v !== 'string') return '';
    const s = v.trim();
    if (!s) return '';
    if (s.startsWith('#')) return s;
    if (/^(mailto|tel):[^\s"'<>]+$/i.test(s)) return s;
    return safeMediaUrl(s);
}

const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback: string, max = 5000) =>
    typeof v === 'string' ? v.slice(0, max) : fallback;

/* ------------------------------------------------------------------ */
/* Sanitise / normalise                                                */
/* ------------------------------------------------------------------ */

export function sanitizeLink(input: unknown, fallback: CmsLink): CmsLink {
    const v = isObj(input) ? input : {};
    const type = LINK_TYPES.includes(v.type as CmsLink['type']) ? (v.type as CmsLink['type']) : fallback.type;
    return {
        label: str(v.label, fallback.label, 120),
        type,
        url: v.url === undefined ? fallback.url : (type === 'phone' ? str(v.url, '', 40) : safeHref(v.url)),
        message: str(v.message, fallback.message, 500),
    };
}

export function sanitizeBackground(input: unknown, fallback: Background): Background {
    const v = isObj(input) ? input : {};
    const pick = (k: 'color' | 'overlayColor') =>
        v[k] === undefined ? fallback[k] : (v[k] === '' ? '' : isColor(v[k]) ? (v[k] as string) : fallback[k]);
    const media = (k: 'image' | 'video' | 'poster') => (v[k] === undefined ? fallback[k] : safeMediaUrl(v[k]));
    const pct = (k: 'videoOpacity' | 'overlayOpacity') =>
        typeof v[k] === 'number' && Number.isFinite(v[k]) ? Math.min(100, Math.max(0, v[k] as number)) : fallback[k];
    return {
        color: pick('color'),
        image: media('image'),
        video: media('video'),
        poster: media('poster'),
        videoOpacity: pct('videoOpacity'),
        overlayColor: pick('overlayColor') || '#000000',
        overlayOpacity: pct('overlayOpacity'),
        textTone: (['auto', 'light', 'dark'] as const).includes(v.textTone as Background['textTone'])
            ? (v.textTone as Background['textTone'])
            : fallback.textTone,
    };
}

function sanitizeValue(field: Field, input: unknown, fallback: unknown): unknown {
    switch (field.kind) {
        case 'text':
            return str(input, fallback as string, field.maxLength ?? 5000);
        case 'image':
        case 'video':
            return input === undefined ? fallback : safeMediaUrl(input);
        case 'color':
            return input === '' ? '' : isColor(input) ? input : fallback;
        case 'toggle':
            return typeof input === 'boolean' ? input : fallback;
        case 'select':
            if (typeof input !== 'string') return fallback;
            // Options loaded at runtime (menu categories) cannot be checked
            // here; any short string is accepted and unknown ids are skipped
            // by the renderer.
            if (field.optionsFrom) return input.slice(0, 120);
            return field.options.some(o => o.value === input) ? input : fallback;
        case 'checks':
            return Array.isArray(input)
                ? field.options.map(o => o.value).filter(v => input.includes(v))
                : fallback;
        case 'range':
            return typeof input === 'number' && Number.isFinite(input)
                ? Math.min(field.max, Math.max(field.min, input))
                : fallback;
        case 'time':
            return typeof input === 'string' && TIME.test(input) ? input : fallback;
        case 'link':
            return sanitizeLink(input, fallback as CmsLink);
        case 'background':
            return sanitizeBackground(input, fallback as Background);
        case 'group':
            return sanitizeFields(field.fields, input, fallback as Record<string, unknown>);
        case 'list': {
            if (!Array.isArray(input)) return fallback;
            return input
                .slice(0, field.max ?? 60)
                .map(item => sanitizeFields(field.fields, item, field.newItem));
        }
    }
}

export function sanitizeFields(
    fields: Field[],
    input: unknown,
    fallback: Record<string, unknown>,
): Record<string, unknown> {
    const v = isObj(input) ? input : {};
    const out: Record<string, unknown> = {};
    for (const field of fields) {
        out[field.key] = sanitizeValue(field, v[field.key], fallback[field.key]);
    }
    return out;
}

/**
 * Normalise a whole document: every section, the show/hide flags, and the
 * section order. `input` may be anything - a stored row from an older version
 * of the site, a request body, or nothing at all - and the result always has
 * exactly the shape the renderers expect.
 */
export function sanitizeDoc<T>(def: DocDef, input: unknown, defaults: T): T {
    const v = isObj(input) ? input : {};
    const d = defaults as unknown as Record<string, Record<string, unknown>>;
    const out: Record<string, unknown> = {};

    for (const section of def.sections) {
        const fb = d[section.key];
        const sec = sanitizeFields(section.fields, v[section.key], fb);
        if (section.hideable) {
            const raw = isObj(v[section.key]) ? (v[section.key] as Record<string, unknown>).visible : undefined;
            sec.visible = typeof raw === 'boolean' ? raw : fb.visible !== false;
        }
        out[section.key] = sec;
    }

    if (def.orderable) {
        const all = def.sections.map(s => s.key);
        const stored = Array.isArray(v.sectionOrder) ? v.sectionOrder.filter((k): k is string => all.includes(k as string)) : [];
        const fallbackOrder = ((d as unknown as { sectionOrder?: string[] }).sectionOrder ?? all);
        const order = [...new Set(stored.length ? stored : fallbackOrder)];
        // A section added to the site after this order was saved still shows.
        for (const k of all) if (!order.includes(k)) order.push(k);
        out.sectionOrder = order;
    }

    return out as T;
}

/* ------------------------------------------------------------------ */
/* Schema helpers for the doc definitions                              */
/* ------------------------------------------------------------------ */

export const bg = (allowVideo = true, label = 'Background'): Field => ({
    kind: 'background', key: 'background', label, allowVideo,
    help: 'Leave everything empty to keep the designed background. A colour replaces it; a photo or video goes over the colour.',
});

export const linkField = (key: string, label: string, help?: string): Field => ({ kind: 'link', key, label, help });

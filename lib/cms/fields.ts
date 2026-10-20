/**
 * The CMS field system.
 *
 * Every editable thing on the site is described ONCE, as a field, and that
 * description drives three separate jobs:
 *
 *   1. the editor form in /admin (labels, help text, widgets),
 *   2. `normalize()`, which repairs whatever comes out of the database into
 *      exactly the shape the components expect, and
 *   3. the TypeScript types the components read (`Value<F>`).
 *
 * The durability of the whole CMS rests on (2). Stored content is never
 * trusted: a missing key takes its default, a value of the wrong type takes its
 * default, an unknown key is dropped, an unknown section type is dropped. So
 * a half-written row, an old row from before a field existed, or a hand-edit in
 * the Supabase dashboard can never crash a page - the worst case is a default
 * showing where a custom value was expected.
 *
 * Adding a field later: add it to the schema with a default. Old documents
 * pick up the default automatically. Removing a field: delete it; old values
 * are dropped on the next read. Renaming one is the only change that needs a
 * migration - see lib/cms/migrations.ts.
 */
import { isHexColor, isSafeHref, isSafeSrc } from './safe';

export interface BaseField {
    label: string;
    help?: string;
    /** Hide this field in the editor unless the predicate passes on its siblings. */
    showIf?: (siblings: Record<string, unknown>) => boolean;
}

export interface ImageValue { src: string; alt: string }
export interface VideoValue { src: string; poster: string }

export interface TextField extends BaseField {
    kind: 'text';
    default: string;
    multiline?: boolean;
    /** Supports *italic*, **bold** and [links](/path). See lib/cms/inline.tsx. */
    inline?: boolean;
    max?: number;
    placeholder?: string;
}
export interface HrefField extends BaseField { kind: 'href'; default: string; placeholder?: string }
export interface ImageField extends BaseField { kind: 'image'; default: ImageValue; noAlt?: boolean }
export interface VideoField extends BaseField { kind: 'video'; default: VideoValue }
export interface FileField extends BaseField { kind: 'file'; default: string; accept: 'font' }
export interface ColorField extends BaseField { kind: 'color'; default: string }
export interface SelectField<O extends string = string> extends BaseField {
    kind: 'select';
    default: O;
    options: readonly { value: O; label: string }[];
    /** Options come from the live database instead of `options`. */
    source?: 'menuCategories';
}
export interface ToggleField extends BaseField { kind: 'toggle'; default: boolean }
export interface NumberField extends BaseField { kind: 'number'; default: number; min: number; max: number; step?: number }
export interface TagsField<O extends string = string> extends BaseField {
    kind: 'tags';
    default: O[];
    options: readonly { value: O; label: string }[];
}
export interface StringsField extends BaseField {
    kind: 'strings';
    default: string[];
    itemName: string;
    max?: number;
    placeholder?: string;
}
export interface ObjectField<F extends Fields = Fields> extends BaseField {
    kind: 'object';
    fields: F;
    /** Render as a collapsed group in the editor. */
    collapsed?: boolean;
}
export interface ListField<F extends Fields = Fields> extends BaseField {
    kind: 'list';
    item: F;
    /** May be partial - every item is normalized against `item`. */
    default: unknown[];
    itemName: string;
    /** Field key whose value labels each item in the collapsed list. */
    summaryKey?: string;
    max?: number;
}

export interface SectionType<F extends Fields = Fields> {
    label: string;
    description: string;
    fields: F;
}
export type SectionTypes = Record<string, SectionType>;
export interface SectionsField<T extends SectionTypes = SectionTypes> extends BaseField {
    kind: 'sections';
    types: T;
    default: unknown[];
}

export type Field =
    | TextField | HrefField | ImageField | VideoField | FileField | ColorField
    | SelectField | ToggleField | NumberField | TagsField | StringsField
    | ObjectField | ListField | SectionsField;

export type Fields = Record<string, Field>;

export type Value<F> =
    F extends TextField | HrefField | ColorField | FileField ? string
    : F extends ImageField ? ImageValue
    : F extends VideoField ? VideoValue
    : F extends SelectField<infer O> ? O
    : F extends ToggleField ? boolean
    : F extends NumberField ? number
    : F extends TagsField<infer O> ? O[]
    : F extends StringsField ? string[]
    : F extends ObjectField<infer FS> ? FieldsValue<FS>
    : F extends ListField<infer FS> ? FieldsValue<FS>[]
    : F extends SectionsField<infer T> ? SectionValue<T>[]
    : never;

export type FieldsValue<FS extends Fields> = { [K in keyof FS]: Value<FS[K]> };

export type SectionValue<T extends SectionTypes> = {
    [K in keyof T & string]: {
        id: string;
        type: K;
        hidden: boolean;
        /** In-page anchor (`/#locations`). Empty for none. */
        anchor: string;
        data: FieldsValue<T[K]['fields']>;
    };
}[keyof T & string];

/* ------------------------------------------------------------------ */
/* Builders. Thin, but they give every field a default and keep the    */
/* literal types that `Value<F>` needs.                                 */
/* ------------------------------------------------------------------ */

type Opt<T, K extends keyof T> = Omit<T, K | 'kind'> & Partial<Pick<T, K>>;

export const f = {
    text: (o: Opt<TextField, 'default'>): TextField => ({ kind: 'text', default: '', ...o }),
    href: (o: Opt<HrefField, 'default'>): HrefField => ({ kind: 'href', default: '', ...o }),
    image: (o: Opt<ImageField, 'default'> & { src?: string; alt?: string }): ImageField => {
        const { src = '', alt = '', ...rest } = o;
        return { kind: 'image', default: { src, alt }, ...rest };
    },
    video: (o: Omit<VideoField, 'kind' | 'default'> & { src?: string; poster?: string }): VideoField => {
        const { src = '', poster = '', ...rest } = o;
        return { kind: 'video', default: { src, poster }, ...rest };
    },
    font: (o: Opt<FileField, 'default' | 'accept'>): FileField => ({ kind: 'file', default: '', accept: 'font', ...o }),
    color: (o: Omit<ColorField, 'kind'>): ColorField => ({ kind: 'color', ...o }),
    select: <const O extends string>(o: Omit<SelectField<O>, 'kind'>): SelectField<O> => ({ kind: 'select', ...o }),
    toggle: (o: Opt<ToggleField, 'default'>): ToggleField => ({ kind: 'toggle', default: false, ...o }),
    number: (o: Omit<NumberField, 'kind'>): NumberField => ({ kind: 'number', ...o }),
    tags: <const O extends string>(o: Omit<TagsField<O>, 'kind'>): TagsField<O> => ({ kind: 'tags', ...o }),
    strings: (o: Opt<StringsField, 'default'>): StringsField => ({ kind: 'strings', default: [], ...o }),
    object: <F extends Fields>(o: Omit<ObjectField<F>, 'kind'>): ObjectField<F> => ({ kind: 'object', ...o }),
    list: <F extends Fields>(o: Opt<ListField<F>, 'default'>): ListField<F> => ({ kind: 'list', default: [], ...o }),
    sections: <T extends SectionTypes>(o: Omit<SectionsField<T>, 'kind'>): SectionsField<T> => ({ kind: 'sections', ...o }),
};

export const section = <F extends Fields>(t: SectionType<F>): SectionType<F> => t;

/* ------------------------------------------------------------------ */
/* Normalization                                                        */
/* ------------------------------------------------------------------ */

const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback: string, max = 5000) =>
    typeof v === 'string' ? v.slice(0, max) : fallback;

export function defaultOf(field: Field): unknown {
    switch (field.kind) {
        case 'object': return normalizeFields(field.fields, undefined);
        case 'list':
        case 'sections': return normalize(field, field.default);
        case 'image': return { ...field.default };
        case 'video': return { ...field.default };
        case 'tags':
        case 'strings': return [...field.default];
        default: return field.default;
    }
}

export function normalizeFields<FS extends Fields>(fields: FS, value: unknown): FieldsValue<FS> {
    const src = isObj(value) ? value : {};
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(fields)) out[key] = normalize(fields[key], src[key]);
    return out as FieldsValue<FS>;
}

export function normalize(field: Field, value: unknown): unknown {
    switch (field.kind) {
        case 'text':
            return str(value, field.default, field.max ?? (field.multiline ? 20000 : 2000));
        case 'href':
            return typeof value === 'string' && isSafeHref(value.trim()) ? value.trim() : field.default;
        case 'file':
            return typeof value === 'string' && isSafeSrc(value.trim()) ? value.trim() : field.default;
        case 'image': {
            if (!isObj(value)) return { ...field.default };
            const src = typeof value.src === 'string' && isSafeSrc(value.src.trim()) ? value.src.trim() : field.default.src;
            return { src, alt: str(value.alt, field.default.alt, 500) };
        }
        case 'video': {
            if (!isObj(value)) return { ...field.default };
            const src = typeof value.src === 'string' && isSafeSrc(value.src.trim()) ? value.src.trim() : field.default.src;
            const poster = typeof value.poster === 'string' && isSafeSrc(value.poster.trim()) ? value.poster.trim() : field.default.poster;
            return { src, poster };
        }
        case 'color':
            return typeof value === 'string' && isHexColor(value) ? value.toLowerCase() : field.default;
        case 'select':
            if (typeof value !== 'string') return field.default;
            if (field.source) return value.slice(0, 200);
            return field.options.some(o => o.value === value) ? value : field.default;
        case 'toggle':
            return typeof value === 'boolean' ? value : field.default;
        case 'number': {
            const n = typeof value === 'number' && Number.isFinite(value) ? value : field.default;
            return Math.min(field.max, Math.max(field.min, n));
        }
        case 'tags': {
            if (!Array.isArray(value)) return [...field.default];
            const allowed = new Set(field.options.map(o => o.value));
            return [...new Set(value.filter((v): v is string => typeof v === 'string' && allowed.has(v)))];
        }
        case 'strings': {
            if (!Array.isArray(value)) return [...field.default];
            return value.filter((v): v is string => typeof v === 'string')
                .slice(0, field.max ?? 200).map(v => v.slice(0, 2000));
        }
        case 'object':
            return normalizeFields(field.fields, value);
        case 'list': {
            const items = Array.isArray(value) ? value : field.default;
            return items.slice(0, field.max ?? 200).map(item => normalizeFields(field.item, item));
        }
        case 'sections':
            return normalizeSections(field, value);
    }
}

function normalizeSections(field: SectionsField, value: unknown) {
    const items = Array.isArray(value) ? value : field.default;
    const seen = new Set<string>();
    const out: unknown[] = [];
    items.slice(0, 100).forEach((raw, index) => {
        if (!isObj(raw) || typeof raw.type !== 'string') return;
        const type = field.types[raw.type];
        if (!type) return;
        // Ids must be deterministic: this runs on the server AND in the
        // preview iframe, and a random id would differ between the two.
        let id = typeof raw.id === 'string' && /^[a-z0-9-]{1,60}$/.test(raw.id) ? raw.id : `${raw.type}-${index}`;
        while (seen.has(id)) id = `${id}-${index}`;
        seen.add(id);
        const anchor = typeof raw.anchor === 'string' && /^[a-z][a-z0-9-]{0,40}$/.test(raw.anchor) ? raw.anchor : '';
        out.push({
            id,
            type: raw.type,
            hidden: raw.hidden === true,
            anchor,
            data: normalizeFields(type.fields, raw.data),
        });
    });
    return out;
}

/** Make a fresh, valid section of `type` - used by the editor's "Add section". */
export function newSection(field: SectionsField, type: string, existingIds: string[]) {
    const def = field.types[type];
    let n = 1;
    while (existingIds.includes(`${type}-${n}`)) n++;
    return { id: `${type}-${n}`, type, hidden: false, anchor: '', data: normalizeFields(def.fields, undefined) };
}

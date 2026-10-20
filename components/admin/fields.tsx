"use client";

import React, { createContext, useContext, useId, useState } from 'react';
import { ChevronRight, ChevronUp, ChevronDown, Copy, Eye, EyeOff, Plus, Trash2, RotateCcw } from 'lucide-react';
import {
    newSection, normalizeFields,
    type Field, type Fields, type ImageValue, type ListField, type SectionsField, type VideoValue,
} from '@/lib/cms/fields';
import { isHexColor, isSafeHref } from '@/lib/cms/safe';
import { MediaPreview, Modal, type PickKind, type Picked } from './media-picker';
import { SortableList, arrayMove } from './sortable';

/**
 * The form side of the CMS editor. It renders whatever the schema in
 * lib/cms/schema.ts describes - nothing here knows what a "hero" or a
 * "location" is - so adding a field to the schema is all it takes to make it
 * editable.
 */

export interface EditorCtx {
    pickMedia: (kind: PickKind, onPick: (p: Picked) => void) => void;
    menuCategories: { id: string; name: string }[];
    focusSection: (id: string) => void;
}
export const EditorContext = createContext<EditorCtx>({
    pickMedia: () => {},
    menuCategories: [],
    focusSection: () => {},
});

type Obj = Record<string, unknown>;

const LINK_SUGGESTIONS = ['/', '/menu', '/#locations', '/#heritage', '/#gift', '/legal/privacy', '/legal/terms'];

export function FieldsEditor({ fields, value, onChange }: { fields: Fields; value: Obj; onChange: (v: Obj) => void }) {
    return (
        <>
            {Object.entries(fields).map(([key, field]) => {
                if (field.showIf && !field.showIf(value)) return null;
                return (
                    <FieldEditor
                        key={key}
                        field={field}
                        value={value[key]}
                        onChange={(v) => onChange({ ...value, [key]: v })}
                    />
                );
            })}
        </>
    );
}

function Label({ field, htmlFor }: { field: Field; htmlFor?: string }) {
    return (
        <>
            <label className="cms-label" htmlFor={htmlFor}>{field.label}</label>
            {field.help && <p className="cms-help">{field.help}</p>}
        </>
    );
}

export function FieldEditor({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
    const id = useId();
    const ctx = useContext(EditorContext);

    switch (field.kind) {
        case 'text': {
            const v = (value as string) ?? '';
            return (
                <div className="cms-field">
                    <Label field={field} htmlFor={id} />
                    {field.multiline ? (
                        <textarea id={id} className="cms-textarea" value={v} placeholder={field.placeholder} rows={Math.min(10, Math.max(3, Math.ceil(v.length / 60)))} onChange={e => onChange(e.target.value)} />
                    ) : (
                        <input id={id} className="cms-input" value={v} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />
                    )}
                    {field.inline && !field.help && <p className="cms-help">Formatting: *italic*, **bold**, [link text](/page)</p>}
                </div>
            );
        }
        case 'href': {
            const v = (value as string) ?? '';
            const ok = isSafeHref(v.trim());
            return (
                <div className="cms-field">
                    <Label field={field} htmlFor={id} />
                    <input id={id} className="cms-input" list={`${id}-list`} value={v} placeholder={field.placeholder} aria-invalid={!ok} onChange={e => onChange(e.target.value)} />
                    <datalist id={`${id}-list`}>{LINK_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
                    {!ok && <p className="cms-error-text">This link will not be saved. Use a page (/menu), a section (/#locations) or a full address (https://…).</p>}
                </div>
            );
        }
        case 'image': {
            const v = (value as ImageValue) ?? field.default;
            return (
                <div className="cms-field">
                    <Label field={field} />
                    <div className="cms-media">
                        <MediaPreview src={v.src} kind="image" />
                        <div className="cms-media-meta">
                            <div className="cms-row">
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => ctx.pickMedia('image', p => onChange({ src: p.src, alt: v.alt || p.alt || '' }))}>
                                    {v.src ? 'Replace' : 'Choose image'}
                                </button>
                                {v.src && <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => onChange({ ...v, src: '' })}>Remove</button>}
                                {v.src !== field.default.src && field.default.src && (
                                    <button type="button" className="cms-icon-btn" title="Back to the original image" aria-label="Back to the original image" onClick={() => onChange({ ...field.default })}><RotateCcw size={14} /></button>
                                )}
                            </div>
                            {v.src && <span className="cms-media-name" title={v.src}>{decodeURIComponent(v.src.split('/').pop() ?? '')}</span>}
                            {!field.noAlt && (
                                <input className="cms-input" aria-label={`${field.label}: description`} placeholder="Describe the image (for Google and screen readers)" value={v.alt} onChange={e => onChange({ ...v, alt: e.target.value })} />
                            )}
                        </div>
                    </div>
                </div>
            );
        }
        case 'video': {
            const v = (value as VideoValue) ?? field.default;
            return (
                <div className="cms-field">
                    <Label field={field} />
                    <div className="cms-media">
                        <MediaPreview src={v.src} kind="video" />
                        <div className="cms-media-meta">
                            <div className="cms-row">
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => ctx.pickMedia('video', p => onChange({ ...v, src: p.src }))}>{v.src ? 'Replace video' : 'Choose video'}</button>
                                {v.src && <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => onChange({ ...v, src: '' })}>Remove</button>}
                            </div>
                            {v.src && <span className="cms-media-name" title={v.src}>{decodeURIComponent(v.src.split('/').pop() ?? '')}</span>}
                        </div>
                    </div>
                    <div className="cms-media">
                        <MediaPreview src={v.poster} kind="image" />
                        <div className="cms-media-meta">
                            <span className="cms-help">Still image shown while the video loads (and to visitors who prefer reduced motion)</span>
                            <div className="cms-row">
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => ctx.pickMedia('image', p => onChange({ ...v, poster: p.src }))}>{v.poster ? 'Replace still' : 'Choose still'}</button>
                                {v.poster && <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => onChange({ ...v, poster: '' })}>Remove</button>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        case 'file': {
            const v = (value as string) ?? '';
            return (
                <div className="cms-field">
                    <Label field={field} />
                    <div className="cms-media">
                        <MediaPreview src={v} kind="font" />
                        <div className="cms-media-meta">
                            <div className="cms-row">
                                <button type="button" className="cms-btn cms-btn--sm" onClick={() => ctx.pickMedia('font', p => onChange(p.src))}>{v ? 'Replace font' : 'Choose font file'}</button>
                                {v && <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => onChange('')}>Remove</button>}
                            </div>
                            {v && <span className="cms-media-name">{decodeURIComponent(v.split('/').pop() ?? '')}</span>}
                        </div>
                    </div>
                </div>
            );
        }
        case 'color': {
            const v = (value as string) ?? field.default;
            return (
                <div className="cms-field">
                    <Label field={field} htmlFor={id} />
                    <div className="cms-color">
                        <input type="color" value={isHexColor(v) ? v : field.default} onChange={e => onChange(e.target.value)} aria-label={`${field.label} picker`} />
                        <input id={id} className="cms-input" value={v} maxLength={7} aria-invalid={!isHexColor(v)} onChange={e => onChange(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)} />
                        {v.toLowerCase() !== field.default.toLowerCase() && (
                            <button type="button" className="cms-btn cms-btn--sm cms-btn--ghost" onClick={() => onChange(field.default)}><RotateCcw size={13} /> Original</button>
                        )}
                    </div>
                </div>
            );
        }
        case 'select': {
            const v = (value as string) ?? field.default;
            const options = field.source === 'menuCategories'
                ? [{ value: '', label: 'Choose a category…' }, ...ctx.menuCategories.map(c => ({ value: c.id, label: c.name }))]
                : field.options;
            const known = options.some(o => o.value === v);
            return (
                <div className="cms-field">
                    <Label field={field} htmlFor={id} />
                    <select id={id} className="cms-select" value={v} onChange={e => onChange(e.target.value)}>
                        {!known && <option value={v}>{v} (not found)</option>}
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            );
        }
        case 'toggle':
            return (
                <div className="cms-field">
                    <label className="cms-switch">
                        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
                        <span className="cms-switch-track" aria-hidden="true" />
                        {field.label}
                    </label>
                    {field.help && <p className="cms-help">{field.help}</p>}
                </div>
            );
        case 'number': {
            const v = typeof value === 'number' ? value : field.default;
            return (
                <div className="cms-field">
                    <Label field={field} htmlFor={id} />
                    <div className="cms-row">
                        <input type="range" min={field.min} max={field.max} step={field.step ?? 1} value={v} onChange={e => onChange(Number(e.target.value))} style={{ flex: 1 }} aria-hidden="true" tabIndex={-1} />
                        <input id={id} type="number" className="cms-input" style={{ maxWidth: 90 }} min={field.min} max={field.max} step={field.step ?? 1} value={v} onChange={e => onChange(Number(e.target.value))} />
                    </div>
                </div>
            );
        }
        case 'tags': {
            const v = (value as string[]) ?? [];
            return (
                <div className="cms-field">
                    <Label field={field} />
                    <div className="cms-chips">
                        {field.options.map(o => {
                            const on = v.includes(o.value);
                            return (
                                <button key={o.value} type="button" className="cms-chip" aria-pressed={on} onClick={() => onChange(on ? v.filter(x => x !== o.value) : [...v, o.value])}>
                                    {o.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }
        case 'strings':
            return <StringsEditor field={field} value={(value as string[]) ?? []} onChange={onChange} />;
        case 'object':
            return <GroupEditor field={field} value={(value as Obj) ?? {}} onChange={onChange} />;
        case 'list':
            return <ListEditor field={field} value={(value as Obj[]) ?? []} onChange={onChange} />;
        case 'sections':
            return <SectionsEditor field={field} value={(value as SectionItem[]) ?? []} onChange={onChange} />;
    }
}

function GroupEditor({ field, value, onChange }: { field: Extract<Field, { kind: 'object' }>; value: Obj; onChange: (v: Obj) => void }) {
    const [open, setOpen] = useState(!field.collapsed);
    const bodyId = useId();
    return (
        <div className="cms-group" data-open={open}>
            <button type="button" className="cms-group-head" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen(o => !o)}>
                <ChevronRight size={16} aria-hidden="true" /> {field.label}
            </button>
            {open && (
                <div className="cms-group-body" id={bodyId}>
                    {field.help && <p className="cms-help" style={{ marginBottom: 10 }}>{field.help}</p>}
                    <FieldsEditor fields={field.fields} value={value} onChange={onChange} />
                </div>
            )}
        </div>
    );
}

/** Stable React keys for list items, which have no ids of their own. */
function useItemKeys(length: number) {
    const [state, setState] = useState<{ keys: string[]; next: number }>(() => ({
        keys: Array.from({ length }, (_, i) => `k${i}`),
        next: length,
    }));
    const keys = state.keys.length === length ? state.keys : Array.from({ length }, (_, i) => state.keys[i] ?? `x${i}`);
    const ops = {
        move: (from: number, to: number) => setState(s => ({ ...s, keys: arrayMove(keys, from, to) })),
        insert: (at: number) => {
            const key = `k${state.next}`;
            setState(s => ({ next: s.next + 1, keys: [...keys.slice(0, at), key, ...keys.slice(at)] }));
            return key;
        },
        remove: (at: number) => setState(s => ({ ...s, keys: keys.filter((_, i) => i !== at) })),
    };
    return { keys, ...ops };
}

function ItemControls({ index, count, onMove, onDuplicate, onRemove, name, extra }: {
    index: number; count: number; name: string;
    onMove: (from: number, to: number) => void;
    onDuplicate?: () => void;
    onRemove: () => void;
    extra?: React.ReactNode;
}) {
    return (
        <>
            {extra}
            <button type="button" className="cms-icon-btn" aria-label={`Move ${name} up`} title="Move up" disabled={index === 0} onClick={() => onMove(index, index - 1)}><ChevronUp size={16} /></button>
            <button type="button" className="cms-icon-btn" aria-label={`Move ${name} down`} title="Move down" disabled={index === count - 1} onClick={() => onMove(index, index + 1)}><ChevronDown size={16} /></button>
            {onDuplicate && <button type="button" className="cms-icon-btn" aria-label={`Duplicate ${name}`} title="Duplicate" onClick={onDuplicate}><Copy size={15} /></button>}
            <button type="button" className="cms-icon-btn cms-icon-btn--danger" aria-label={`Delete ${name}`} title="Delete" onClick={onRemove}><Trash2 size={15} /></button>
        </>
    );
}

function firstImage(fields: Fields, item: Obj): string {
    for (const [k, f] of Object.entries(fields)) {
        if (f.kind === 'image') return (item[k] as ImageValue)?.src ?? '';
    }
    return '';
}

function summarize(field: ListField, item: Obj, index: number): { title: string; sub?: string } {
    const named = field.summaryKey ? String(item[field.summaryKey] ?? '').trim() : '';
    const img = firstImage(field.item, item);
    const alt = Object.entries(field.item).find(([, f]) => f.kind === 'image');
    const altText = alt ? (item[alt[0]] as ImageValue)?.alt : '';
    const title = named || altText || `${field.itemName[0].toUpperCase()}${field.itemName.slice(1)} ${index + 1}`;
    return { title: title.length > 80 ? `${title.slice(0, 80)}…` : title, sub: img ? decodeURIComponent(img.split('/').pop() ?? '') : undefined };
}

function ListEditor({ field, value, onChange }: { field: ListField; value: Obj[]; onChange: (v: Obj[]) => void }) {
    const { keys, move, insert, remove } = useItemKeys(value.length);
    const [open, setOpen] = useState<Set<string>>(new Set());
    const toggle = (k: string) => setOpen(s => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
    const atMax = field.max !== undefined && value.length >= field.max;

    const doMove = (from: number, to: number) => { move(from, to); onChange(arrayMove(value, from, to)); };
    const add = () => {
        const key = insert(value.length);
        onChange([...value, normalizeFields(field.item, undefined)]);
        setOpen(s => new Set(s).add(key));
    };

    return (
        <div className="cms-field">
            <Label field={field} />
            {value.length > 0 && (
                <SortableList
                    items={value}
                    keyOf={(_, i) => keys[i]}
                    onMove={doMove}
                    label={field.itemName}
                    render={(item, { handle, dragging, index }) => {
                        const key = keys[index];
                        const isOpen = open.has(key);
                        const { title, sub } = summarize(field, item, index);
                        const img = firstImage(field.item, item);
                        return (
                            <div className={`cms-item${dragging ? ' is-dragging' : ''}`} data-sortable-item="">
                                <div className="cms-item-head">
                                    {handle}
                                    {img && (
                                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                                        <img className="cms-thumb" src={img} alt="" loading="lazy" />
                                    )}
                                    <button type="button" className="cms-item-title" aria-expanded={isOpen} onClick={() => toggle(key)}>
                                        {title}
                                        {sub && <small>{sub}</small>}
                                    </button>
                                    <ItemControls
                                        index={index}
                                        count={value.length}
                                        name={field.itemName}
                                        onMove={doMove}
                                        onDuplicate={atMax ? undefined : () => { insert(index + 1); onChange([...value.slice(0, index + 1), structuredClone(item), ...value.slice(index + 1)]); }}
                                        onRemove={() => {
                                            if (!confirm(`Delete this ${field.itemName}?`)) return;
                                            remove(index);
                                            onChange(value.filter((_, i) => i !== index));
                                        }}
                                    />
                                </div>
                                {isOpen && (
                                    <div className="cms-item-body">
                                        <FieldsEditor fields={field.item} value={item} onChange={(v) => onChange(value.map((x, i) => (i === index ? v : x)))} />
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            )}
            {!atMax && (
                <button type="button" className="cms-btn cms-add" onClick={add}><Plus size={15} /> Add {field.itemName}</button>
            )}
        </div>
    );
}

function StringsEditor({ field, value, onChange }: { field: Extract<Field, { kind: 'strings' }>; value: string[]; onChange: (v: string[]) => void }) {
    const { keys, move, insert, remove } = useItemKeys(value.length);
    const doMove = (from: number, to: number) => { move(from, to); onChange(arrayMove(value, from, to)); };
    return (
        <div className="cms-field">
            <Label field={field} />
            {value.length > 0 && (
                <SortableList
                    items={value}
                    keyOf={(_, i) => keys[i]}
                    onMove={doMove}
                    label={field.itemName}
                    render={(item, { handle, dragging, index }) => (
                        <div className={`cms-item${dragging ? ' is-dragging' : ''}`} data-sortable-item="">
                            <div className="cms-item-head">
                                {handle}
                                <input className="cms-input" aria-label={`${field.itemName} ${index + 1}`} placeholder={field.placeholder} value={item} onChange={e => onChange(value.map((x, i) => (i === index ? e.target.value : x)))} />
                                <button type="button" className="cms-icon-btn cms-icon-btn--danger" aria-label={`Delete ${field.itemName} ${index + 1}`} onClick={() => { remove(index); onChange(value.filter((_, i) => i !== index)); }}><Trash2 size={15} /></button>
                            </div>
                        </div>
                    )}
                />
            )}
            <button type="button" className="cms-btn cms-add" onClick={() => { insert(value.length); onChange([...value, '']); }}><Plus size={15} /> Add {field.itemName}</button>
        </div>
    );
}

interface SectionItem { id: string; type: string; hidden: boolean; anchor: string; data: Obj }

function SectionsEditor({ field, value, onChange }: { field: SectionsField; value: SectionItem[]; onChange: (v: SectionItem[]) => void }) {
    const ctx = useContext(EditorContext);
    const [open, setOpen] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const doMove = (from: number, to: number) => onChange(arrayMove(value, from, to));
    const update = (index: number, patch: Partial<SectionItem>) => onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));

    return (
        <div className="cms-field">
            <Label field={field} />
            <SortableList
                items={value}
                keyOf={(s) => s.id}
                onMove={doMove}
                label="section"
                render={(section, { handle, dragging, index }) => {
                    const type = field.types[section.type];
                    const isOpen = open === section.id;
                    const name = type?.label ?? section.type;
                    const detail = (section.data.heading ?? section.data.title ?? section.data.quote ?? '') as string;
                    return (
                        <div className={`cms-item${dragging ? ' is-dragging' : ''}${section.hidden ? ' is-hidden' : ''}`} data-sortable-item="">
                            <div className="cms-item-head">
                                {handle}
                                <button
                                    type="button"
                                    className="cms-item-title"
                                    aria-expanded={isOpen}
                                    onClick={() => {
                                        const next = isOpen ? null : section.id;
                                        setOpen(next);
                                        if (next && !section.hidden) ctx.focusSection(next);
                                    }}
                                >
                                    {name}
                                    <small>{section.hidden ? 'Hidden - not on the page' : (detail.replace(/\*/g, '') || ' ')}</small>
                                </button>
                                <ItemControls
                                    index={index}
                                    count={value.length}
                                    name="section"
                                    onMove={doMove}
                                    extra={
                                        <button type="button" className="cms-icon-btn" aria-pressed={section.hidden} aria-label={section.hidden ? 'Show this section' : 'Hide this section'} title={section.hidden ? 'Hidden - click to show' : 'Visible - click to hide'} onClick={() => update(index, { hidden: !section.hidden })}>
                                            {section.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    }
                                    onDuplicate={() => {
                                        const copy = { ...structuredClone(section), id: newSection(field, section.type, value.map(s => s.id)).id, anchor: '' };
                                        onChange([...value.slice(0, index + 1), copy, ...value.slice(index + 1)]);
                                    }}
                                    onRemove={() => {
                                        if (!confirm(`Delete the "${name}" section? You can hide it instead (eye button) to keep its content.`)) return;
                                        onChange(value.filter((_, i) => i !== index));
                                    }}
                                />
                            </div>
                            {isOpen && type && (
                                <div className="cms-item-body">
                                    <p className="cms-help">{type.description}</p>
                                    <FieldsEditor fields={type.fields} value={section.data} onChange={(data) => update(index, { data })} />
                                    <div className="cms-field">
                                        <label className="cms-label" htmlFor={`anchor-${section.id}`}>Link name (optional)</label>
                                        <p className="cms-help">Lets menus link straight to this section, e.g. <code>locations</code> makes <code>/#locations</code> work. Lowercase letters, numbers and dashes.</p>
                                        <input
                                            id={`anchor-${section.id}`}
                                            className="cms-input"
                                            value={section.anchor}
                                            aria-invalid={section.anchor !== '' && !/^[a-z][a-z0-9-]{0,40}$/.test(section.anchor)}
                                            onChange={e => update(index, { anchor: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }}
            />
            <button type="button" className="cms-btn cms-add" onClick={() => setAdding(true)}><Plus size={15} /> Add a section</button>

            {adding && (
                <Modal title="Add a section" onClose={() => setAdding(false)}>
                    <div className="cms-modal-body">
                        <p className="cms-help" style={{ marginBottom: 14 }}>It is added at the bottom of the page - drag it into place afterwards.</p>
                        <div className="cms-grid">
                            {Object.entries(field.types).map(([key, t]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className="cms-card cms-tile"
                                    style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
                                    onClick={() => {
                                        const s = newSection(field, key, value.map(x => x.id)) as SectionItem;
                                        onChange([...value, s]);
                                        setOpen(s.id);
                                        setAdding(false);
                                        setTimeout(() => ctx.focusSection(s.id), 400);
                                    }}
                                >
                                    <h3>{t.label}</h3>
                                    <p>{t.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}


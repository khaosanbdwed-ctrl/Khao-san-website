"use client";

import React, { createContext, useContext, useState } from 'react';
import { FOCUS_OPTIONS, TEXT_TONES, type Background, type CmsLink, type Field } from '@/lib/cms/fields';
import { MediaPickerModal, UploadButton, type MediaKind } from './media-library';

/**
 * Form controls for every field kind in lib/cms/fields.ts. The editor renders
 * whatever the schema describes, so a new field in a doc definition shows up
 * in the dashboard with no UI work.
 */

export const EditorContext = createContext<{ categories: { id: string; name: string }[] }>({ categories: [] });

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const PAGE_SUGGESTIONS = ['/', '/menu', '/#locations', '/#heritage', '/#gift', '/legal/privacy', '/legal/terms'];

function Label({ text, onReset, children }: { text: string; onReset?: () => void; children?: React.ReactNode }) {
    return (
        <div className="cms-field__label">
            <span>{text}</span>
            <span className="cms-row" style={{ gap: 8 }}>
                {children}
                {onReset && (
                    <button type="button" className="cms-btn cms-btn--link cms-small" onClick={onReset} title="Put back the original">
                        Reset
                    </button>
                )}
            </span>
        </div>
    );
}

const Help = ({ text }: { text?: string }) => (text ? <p className="cms-field__help">{text}</p> : null);

/** WCAG contrast ratio of two #rgb / #rrggbb colours. */
function contrastRatio(a: string, b: string): number {
    const lum = (hex: string) => {
        const h = hex.length === 4 ? hex.slice(1).split('').map(c => c + c).join('') : hex.slice(1, 7);
        const [r, g, bl] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
            .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
        return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
    };
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
}

const pathValue = (obj: Record<string, unknown>, path: string): unknown =>
    path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);

/** The warning a colour field shows when its text would be hard to read on
 *  the ground it names (see ContrastCheck in lib/cms/fields.ts). */
function contrastWarning(field: Field, siblings: Record<string, unknown>): string | null {
    if (field.kind !== 'color' || !field.contrast) return null;
    const c = field.contrast;
    if (c.mediaKeys?.some(k => pathValue(siblings, k))) return null;
    const groundSet = pathValue(siblings, c.groundKey);
    const ground = typeof groundSet === 'string' && groundSet ? groundSet : c.groundDefault;
    const tone = c.toneKey ? pathValue(siblings, c.toneKey) : 'auto';
    const ink = (siblings[field.key] as string) || (tone === 'light' || tone === 'dark' ? c.inkDefault[tone] : undefined) || c.inkDefault.auto;
    // Opaque #rgb / #rrggbb only: a colour with transparency (#rrggbbaa)
    // depends on what is under it, so it is not judged rather than misjudged.
    const opaque = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
    if (!opaque.test(ground) || !opaque.test(ink)) return null;
    const ratio = contrastRatio(ink, ground);
    if (ratio >= 4.5) return null;
    // A light ground needs darker text, and the other way round.
    const needDarker = contrastRatio(ground, '#000000') > contrastRatio(ground, '#ffffff');
    const which = siblings[field.key] ? 'this colour' : 'the default colour';
    return `Hard to read: ${which} on this background measures ${ratio.toFixed(1)}:1, and text needs at least 4.5:1. Choose a ${needDarker ? 'darker' : 'lighter'} colour here, or change the background.`;
}

/* ------------------------------------------------------------------ */

function MediaInput({ kind, value, onChange, jpeg }: { kind: MediaKind; value: string; onChange: (v: string) => void; jpeg?: boolean }) {
    const [picking, setPicking] = useState(false);
    const [showUrl, setShowUrl] = useState(false);
    return (
        <div className="cms-media">
            <div className="cms-media__preview">
                {!value ? (kind === 'image' ? 'No photo' : 'No video')
                    : kind === 'image'
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={value} alt="" />
                        : <video key={value} src={value} muted loop autoPlay playsInline />}
            </div>
            <div className="cms-media__side">
                <div className="cms-row" style={{ gap: 6 }}>
                    <UploadButton kind={kind} onUploaded={onChange} jpeg={jpeg} />
                    <button type="button" className="cms-btn cms-btn--small" onClick={() => setPicking(true)}>Choose from library</button>
                    {value && <button type="button" className="cms-btn cms-btn--small cms-btn--danger" onClick={() => onChange('')}>Remove</button>}
                </div>
                {value && <span className="cms-media__path">{decodeURIComponent(value.split('/').pop() || value)}</span>}
                <button type="button" className="cms-btn cms-btn--link cms-small" style={{ alignSelf: 'flex-start' }} onClick={() => setShowUrl(v => !v)}>
                    {showUrl ? 'Hide link' : 'Or paste a link'}
                </button>
                {showUrl && (
                    <input className="cms-input" value={value} placeholder="https://… or /assets/…" onChange={e => onChange(e.target.value)} />
                )}
            </div>
            {picking && <MediaPickerModal kind={kind} onChoose={onChange} onClose={() => setPicking(false)} />}
        </div>
    );
}

function ColorInput({ value, onChange, emptyLabel = 'Design default' }: { value: string; onChange: (v: string) => void; emptyLabel?: string }) {
    const [text, setText] = useState(value);
    // Follow the value when it changes from outside (Reset, the picker) without
    // fighting a half-typed hex code in the box.
    const [prev, setPrev] = useState(value);
    if (value !== prev) { setPrev(value); setText(value); }
    return (
        <div className="cms-color">
            {value
                ? <input type="color" value={value.slice(0, 7)} onChange={e => { setText(e.target.value); onChange(e.target.value); }} aria-label="Pick a colour" />
                : <span className="cms-swatch-empty" title={emptyLabel} />}
            <input
                className="cms-input"
                value={text}
                placeholder={emptyLabel}
                onChange={e => {
                    setText(e.target.value);
                    if (e.target.value === '' || /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(e.target.value)) onChange(e.target.value);
                }}
            />
            {!value && <button type="button" className="cms-btn cms-btn--small" onClick={() => onChange('#1e417b')}>Choose colour</button>}
            {value && <button type="button" className="cms-btn cms-btn--small" onClick={() => { setText(''); onChange(''); }}>{emptyLabel}</button>}
        </div>
    );
}

function LinkInput({ value, onChange }: { value: CmsLink; onChange: (v: CmsLink) => void }) {
    const set = (patch: Partial<CmsLink>) => onChange({ ...value, ...patch });
    return (
        <div className="cms-group">
            <div className="cms-grid-2">
                <div className="cms-field">
                    <Label text="Button text" />
                    <input className="cms-input" value={value.label} onChange={e => set({ label: e.target.value })} />
                    <Help text="Leave empty to hide the button." />
                </div>
                <div className="cms-field">
                    <Label text="When clicked" />
                    <select className="cms-select" value={value.type} onChange={e => set({ type: e.target.value as CmsLink['type'] })}>
                        <option value="url">Open a page or web address</option>
                        <option value="whatsapp">Open a WhatsApp chat</option>
                        <option value="phone">Call a phone number</option>
                    </select>
                </div>
            </div>
            {value.type === 'whatsapp' ? (
                <div className="cms-field">
                    <Label text="Message typed in for the visitor" />
                    <input className="cms-input" value={value.message} onChange={e => set({ message: e.target.value })} />
                    <Help text="Sent to the main WhatsApp number in Locations & hours." />
                </div>
            ) : (
                <div className="cms-field">
                    <Label text={value.type === 'phone' ? 'Phone number' : 'Page or web address'} />
                    <input
                        className="cms-input"
                        value={value.url}
                        list={value.type === 'url' ? 'cms-page-suggestions' : undefined}
                        placeholder={value.type === 'phone' ? '+880 1600-068193' : '/menu  or  https://…'}
                        onChange={e => set({ url: e.target.value })}
                    />
                </div>
            )}
            <datalist id="cms-page-suggestions">{PAGE_SUGGESTIONS.map(p => <option key={p} value={p} />)}</datalist>
        </div>
    );
}

function BackgroundInput({ value, onChange, allowVideo, defaultValue }: { value: Background; onChange: (v: Background) => void; allowVideo?: boolean; defaultValue?: Background }) {
    const set = (patch: Partial<Background>) => onChange({ ...value, ...patch });
    const designed = !value.color && !value.image && !value.video && value.overlayOpacity === 0;
    const sub = (label: string, key: keyof Background, node: React.ReactNode, help?: string) => (
        <div className="cms-field">
            <Label text={label} onReset={defaultValue && !same(value[key], defaultValue[key]) ? () => set({ [key]: defaultValue[key] } as Partial<Background>) : undefined} />
            {node}
            <Help text={help} />
        </div>
    );
    return (
        <div className="cms-bg">
            {designed && <p className="cms-field__help" style={{ margin: '12px 0 0' }}>Using the designed background.</p>}
            {sub('Colour', 'color', <ColorInput value={value.color} onChange={color => set({ color })} />)}
            {sub('Photo', 'image', <MediaInput kind="image" value={value.image} onChange={image => set({ image })} />)}
            {allowVideo !== false && sub('Video', 'video', <MediaInput kind="video" value={value.video} onChange={video => set({ video, poster: '' })} />, 'Plays silently on a loop over the colour and photo. Uploads get a lighter version for phones automatically.')}
            {allowVideo !== false && value.video && sub('Still shown while the video loads', 'poster', <MediaInput kind="image" value={value.poster} onChange={poster => set({ poster })} />, 'Optional - an uploaded video already has one taken from its first moments.')}
            {allowVideo !== false && value.video && sub('Video strength', 'videoOpacity', <Range value={value.videoOpacity} onChange={videoOpacity => set({ videoOpacity })} />)}
            {(value.image || (allowVideo !== false && value.video)) && sub('Focus', 'focus', (
                <select className="cms-select" value={value.focus} onChange={e => set({ focus: e.target.value as Background['focus'] })}>
                    {FOCUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ), 'The photo or video always fills the section on every screen, cropping what does not fit. Choose which part stays in view.')}
            {sub('Darken / tint over everything', 'overlayOpacity', (
                <div className="cms-row">
                    <ColorInput value={value.overlayColor} onChange={overlayColor => set({ overlayColor: overlayColor || '#000000' })} emptyLabel="Black" />
                    <div className="cms-grow"><Range value={value.overlayOpacity} onChange={overlayOpacity => set({ overlayOpacity })} /></div>
                </div>
            ), 'Raise this to make text easier to read over a busy photo or video. 0% = off.')}
            {sub('Text colour', 'textTone', (
                <select className="cms-select" value={value.textTone} onChange={e => set({ textTone: e.target.value as Background['textTone'] })}>
                    {TEXT_TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
            ), 'If you change the background to something much lighter or darker, switch the text to match.')}
        </div>
    );
}

function Range({ value, onChange, min = 0, max = 100, step = 1, unit = '%' }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string }) {
    return (
        <div className="cms-row">
            <input type="range" className="cms-grow" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
            <span style={{ minWidth: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{value}{unit}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ */

function ListInput({ field, value, onChange }: { field: Extract<Field, { kind: 'list' }>; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void }) {
    const [open, setOpen] = useState<number | null>(null);
    const move = (i: number, d: number) => {
        const next = [...value];
        [next[i], next[i + d]] = [next[i + d], next[i]];
        onChange(next);
        if (open === i) setOpen(i + d);
    };
    const titleOf = (item: Record<string, unknown>, i: number) => {
        const t = field.titleKey ? item[field.titleKey] : '';
        return (typeof t === 'string' && t.trim()) || `${field.itemLabel[0].toUpperCase()}${field.itemLabel.slice(1)} ${i + 1}`;
    };
    const thumbOf = (item: Record<string, unknown>) => {
        const imgField = field.fields.find(f => f.kind === 'image');
        const v = imgField ? item[imgField.key] : '';
        return typeof v === 'string' && v ? v : null;
    };
    return (
        <div className="cms-list">
            {value.map((item, i) => (
                <div className="cms-item" key={i}>
                    <div className="cms-item__head">
                        <button type="button" className="cms-section__toggle" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                            <Chevron open={open === i} />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {thumbOf(item) && <img className="cms-item__thumb" src={thumbOf(item)!} alt="" />}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titleOf(item, i)}</span>
                        </button>
                        <button type="button" className="cms-icon-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
                        <button type="button" className="cms-icon-btn" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
                        <button
                            type="button"
                            className="cms-icon-btn"
                            onClick={() => { if (confirm(`Remove "${titleOf(item, i)}"?`)) { onChange(value.filter((_, j) => j !== i)); setOpen(null); } }}
                            aria-label="Remove"
                            style={{ color: 'var(--cms-danger)' }}
                        >✕</button>
                    </div>
                    {open === i && (
                        <div className="cms-item__body">
                            <Fields
                                fields={field.fields}
                                value={item}
                                defaults={undefined}
                                onChange={v => onChange(value.map((x, j) => (j === i ? v : x)))}
                            />
                        </div>
                    )}
                </div>
            ))}
            {value.length < (field.max ?? 60) && (
                <button
                    type="button"
                    className="cms-btn cms-btn--small"
                    style={{ alignSelf: 'flex-start' }}
                    onClick={() => { onChange([...value, structuredClone(field.newItem)]); setOpen(value.length); }}
                >+ Add {field.itemLabel}</button>
            )}
        </div>
    );
}

export function Chevron({ open }: { open?: boolean }) {
    return (
        <svg className="cms-section__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true" style={{ transform: open ? 'rotate(90deg)' : undefined }}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

/* ------------------------------------------------------------------ */

export function FieldEditor({ field, value, defaultValue, onChange }: { field: Field; value: unknown; defaultValue?: unknown; onChange: (v: unknown) => void }) {
    const { categories } = useContext(EditorContext);
    const reset = defaultValue !== undefined && !same(value, defaultValue) && field.kind !== 'list' && field.kind !== 'background' && field.kind !== 'group'
        ? () => onChange(structuredClone(defaultValue))
        : undefined;

    let control: React.ReactNode;
    switch (field.kind) {
        case 'text':
            control = field.multiline || (typeof value === 'string' && value.includes('\n'))
                ? <textarea className="cms-textarea" value={value as string} maxLength={field.maxLength} onChange={e => onChange(e.target.value)} rows={field.maxLength && field.maxLength > 1000 ? 8 : 4} />
                : <input className="cms-input" value={value as string} maxLength={field.maxLength} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />;
            break;
        case 'image':
        case 'video':
            control = <MediaInput kind={field.kind} value={value as string} onChange={onChange} jpeg={field.kind === 'image' && field.format === 'jpeg'} />;
            if (field.kind === 'video') {
                control = <>{control}<Help text="Uploads are optimised automatically, with a lighter version for phones." /></>;
            }
            break;
        case 'color':
            control = <ColorInput value={value as string} onChange={onChange} />;
            break;
        case 'toggle':
            return (
                <div className="cms-field">
                    <div className="cms-row" style={{ justifyContent: 'space-between' }}>
                        <label className="cms-switch">
                            <input type="checkbox" checked={value as boolean} onChange={e => onChange(e.target.checked)} />
                            {field.label}
                        </label>
                        {reset && <button type="button" className="cms-btn cms-btn--link cms-small" onClick={reset}>Reset</button>}
                    </div>
                    <Help text={field.help} />
                </div>
            );
        case 'select': {
            const options = field.optionsFrom === 'menuCategories'
                ? categories.map(c => ({ value: c.id, label: c.name }))
                : field.options;
            const known = options.some(o => o.value === value);
            control = (
                <select className="cms-select" value={value as string} onChange={e => onChange(e.target.value)}>
                    {!known && <option value={value as string}>{(value as string) || 'Choose…'}</option>}
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            );
            break;
        }
        case 'checks': {
            const arr = (value as string[]) ?? [];
            control = (
                <div className="cms-checks">
                    {field.options.map(o => (
                        <label key={o.value} className="cms-check">
                            <input
                                type="checkbox"
                                checked={arr.includes(o.value)}
                                onChange={e => onChange(e.target.checked ? [...arr, o.value] : arr.filter(v => v !== o.value))}
                            />
                            {o.label}
                        </label>
                    ))}
                </div>
            );
            break;
        }
        case 'range':
            control = <Range value={value as number} onChange={onChange} min={field.min} max={field.max} step={field.step} unit={field.unit} />;
            break;
        case 'time':
            control = <input type="time" className="cms-input" style={{ width: 150 }} value={value as string} onChange={e => onChange(e.target.value)} />;
            break;
        case 'link':
            control = <LinkInput value={value as CmsLink} onChange={onChange} />;
            break;
        case 'background':
            control = <BackgroundInput value={value as Background} onChange={onChange} allowVideo={field.allowVideo} defaultValue={defaultValue as Background | undefined} />;
            break;
        case 'group':
            control = (
                <div className="cms-group">
                    <Fields fields={field.fields} value={value as Record<string, unknown>} defaults={defaultValue as Record<string, unknown> | undefined} onChange={onChange} />
                </div>
            );
            break;
        case 'list':
            control = <ListInput field={field} value={value as Record<string, unknown>[]} onChange={onChange} />;
            break;
    }

    const listReset = (field.kind === 'list' || field.kind === 'background') && defaultValue !== undefined && !same(value, defaultValue)
        ? () => { if (confirm(`Put "${field.label}" back to the original? Your changes to it will be lost.`)) onChange(structuredClone(defaultValue)); }
        : undefined;

    return (
        <div className="cms-field">
            <Label text={field.label} onReset={reset ?? listReset} />
            {field.kind === 'text' && field.rich && !field.multiline && (
                <p className="cms-field__help" style={{ marginTop: -2, marginBottom: 6 }}>Put *asterisks* around words to set them in italic.</p>
            )}
            {control}
            <Help text={field.help} />
        </div>
    );
}

export function Fields({ fields, value, defaults, onChange }: {
    fields: Field[];
    value: Record<string, unknown>;
    defaults?: Record<string, unknown>;
    onChange: (v: Record<string, unknown>) => void;
}) {
    return (
        <>
            {fields.map(f => {
                const warning = contrastWarning(f, value);
                return (
                    <React.Fragment key={f.key}>
                        <FieldEditor
                            field={f}
                            value={value[f.key]}
                            defaultValue={defaults?.[f.key]}
                            onChange={v => onChange(
                                // A new video makes the old still wrong; clear a sibling
                                // poster so the new video's own still is used instead.
                                f.kind === 'video' && v !== value[f.key] && fields.some(x => x.key === 'poster')
                                    ? { ...value, [f.key]: v, poster: '' }
                                    : { ...value, [f.key]: v },
                            )}
                        />
                        {warning && <p className="cms-contrast-warning" role="status">{warning}</p>}
                    </React.Fragment>
                );
            })}
        </>
    );
}

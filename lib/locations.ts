import { DAYS, type CmsHours, type LocationsContent } from '@/lib/cms/docs/locations';

/**
 * The outlets, as the components consume them.
 *
 * The data itself now lives in the CMS (Locations & hours in the dashboard;
 * defaults in lib/cms/docs/locations.ts). This file turns that into the shape
 * the Locations chapter, the footer and the Restaurant JSON-LD read, and -
 * the part that matters for NAP consistency - derives the VISIBLE hours from
 * the same structured hours that go into the JSON-LD. The footer used to hand-
 * type its hours, so editing them in one place updated Google's data and not
 * the page.
 */
export interface Location {
    name: string;
    address: string;
    /** Digits only, no `+`, for wa.me links. */
    whatsapp: string;
    /** E.164, for `tel:` hrefs. */
    tel: string;
    /** Human-readable, for display. */
    phoneDisplay: string;
    /** "Sat–Thu: 12:00 PM – 11:00 PM" */
    hours: string[];
    /** Machine-readable hours for schema.org openingHoursSpecification. */
    openingHours: CmsHours[];
    imageSrc: string;
    mapQuery: string;
}

const digits = (s: string) => s.replace(/\D/g, '');

export function toLocations(content: LocationsContent): Location[] {
    return content.outlets.items.map(o => ({
        name: o.name,
        address: o.address,
        whatsapp: digits(o.whatsapp) || digits(content.general.primaryWhatsapp),
        tel: digits(o.phone) ? `+${digits(o.phone)}` : '',
        phoneDisplay: o.phone,
        hours: hoursLines(o.hours),
        openingHours: o.hours.filter(h => h.days.length),
        imageSrc: o.image,
        mapQuery: o.mapQuery || o.address,
    }));
}

/** Week order is the restaurant's own: Saturday first, Friday last. */
export function dayRanges(days: string[]): string[] {
    const idx = DAYS.map((d, i) => (days.includes(d) ? i : -1)).filter(i => i >= 0);
    const runs: [number, number][] = [];
    for (const i of idx) {
        const last = runs[runs.length - 1];
        if (last && last[1] === i - 1) last[1] = i;
        else runs.push([i, i]);
    }
    return runs.map(([a, b]) =>
        a === b ? DAYS[a] : `${DAYS[a].slice(0, 3)}${b - a === 1 ? ', ' : '–'}${DAYS[b].slice(0, 3)}`,
    );
}

export function clock(t: string, compact = false) {
    const [h, m] = t.split(':').map(Number);
    const mer = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    if (compact) return { time: m ? `${h12}:${String(m).padStart(2, '0')}` : String(h12), mer };
    return { time: `${h12}:${String(m).padStart(2, '0')}`, mer: mer.toUpperCase() };
}

function hoursLines(hours: CmsHours[]): string[] {
    return hours
        .filter(h => h.days.length)
        .map(h => {
            const o = clock(h.opens), c = clock(h.closes);
            return `${dayRanges(h.days).join(', ')}: ${o.time} ${o.mer} – ${c.time} ${c.mer}`;
        });
}

export const waLink = (message: string, number: string) =>
    `https://wa.me/${digits(number)}?text=${encodeURIComponent(message)}`;

export const mapLink = (query: string) =>
    `https://maps.google.com/?q=${encodeURIComponent(query)}`;

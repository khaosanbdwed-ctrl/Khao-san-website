import type { DocDef, Option } from '../fields';

/**
 * The three rooms - one source of truth, now edited from the dashboard.
 *
 * ⚠ NAP consistency is the one thing local search will not forgive: the name,
 * address and phone here must match the Google Business Profile and every
 * directory citation character for character. Everything that shows an outlet
 * - the Locations chapter, the footer, the footer's Restaurant JSON-LD - reads
 * this document, and the visible hours are generated from the same structured
 * hours that go into the JSON-LD, so the two can no longer disagree.
 */

export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const DAY_OPTIONS: Option[] = DAYS.map(d => ({ value: d, label: d.slice(0, 3) }));

export interface CmsHours { days: string[]; opens: string; closes: string }
export interface CmsOutlet {
    name: string;
    address: string;
    phone: string;
    whatsapp: string;
    mapQuery: string;
    image: string;
    hours: CmsHours[];
}
export interface LocationsContent {
    general: { primaryWhatsapp: string };
    outlets: { items: CmsOutlet[] };
}

const STANDARD_HOURS: CmsHours[] = [
    { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '12:00', closes: '23:00' },
    { days: ['Friday'], opens: '14:00', closes: '23:00' },
];

export const locationsDefaults: LocationsContent = {
    general: { primaryWhatsapp: '8801600068193' },
    outlets: {
        items: [
            {
                // The outlet is called "Gulshan"; "Gulshan 1" stays in the
                // address and map search below, where it is the postal area.
                name: 'Gulshan',
                address: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka 1212',
                phone: '+880 1600-068193',
                whatsapp: '8801600068193',
                mapQuery: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka',
                image: '/assets/Location_Image_1_1/Gulshan_Outlet_2.webp',
                hours: STANDARD_HOURS,
            },
            {
                name: 'Dhanmondi',
                address: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
                phone: '+880 1603-523731',
                whatsapp: '8801603523731',
                mapQuery: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
                image: '/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp',
                hours: STANDARD_HOURS,
            },
            {
                name: 'Uttara',
                address: 'House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka',
                phone: '+880 1627-167758',
                whatsapp: '8801627167758',
                mapQuery: 'House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka',
                image: '/assets/Location_Image_1_1/Uttara_Outlet_3.webp',
                hours: STANDARD_HOURS,
            },
        ],
    },
};

export const locationsDoc: DocDef = {
    key: 'locations',
    title: 'Locations & hours',
    description: 'Outlet names, addresses, phone and WhatsApp numbers, opening hours and photos. Used by the homepage Locations section, the footer, and the information Google reads about each outlet.',
    previewPath: '/#locations',
    sections: [
        {
            key: 'general',
            title: 'Main contact',
            fields: [
                {
                    kind: 'text', key: 'primaryWhatsapp', label: 'Main WhatsApp number', maxLength: 20,
                    help: 'Digits only, with country code and no "+" (e.g. 8801600068193). Every "Contact us" and "Book a table" button that is set to WhatsApp opens a chat with this number.',
                },
            ],
        },
        {
            key: 'outlets',
            title: 'Outlets',
            description: 'Keep each name, address and phone exactly as they appear on Google Maps.',
            fields: [
                {
                    kind: 'list', key: 'items', label: 'Outlets', itemLabel: 'outlet', titleKey: 'name', max: 12,
                    newItem: { name: 'New outlet', address: '', phone: '', whatsapp: '', mapQuery: '', image: '', hours: STANDARD_HOURS },
                    fields: [
                        { kind: 'text', key: 'name', label: 'Outlet name', maxLength: 80 },
                        { kind: 'text', key: 'address', label: 'Address', multiline: true, maxLength: 300 },
                        { kind: 'text', key: 'phone', label: 'Phone (as shown)', maxLength: 40, help: 'Shown on the site and used for the tap-to-call link, e.g. +880 1600-068193.' },
                        { kind: 'text', key: 'whatsapp', label: 'WhatsApp number', maxLength: 20, help: 'Digits only, with country code, e.g. 8801600068193.' },
                        { kind: 'text', key: 'mapQuery', label: 'Google Maps search', maxLength: 300, help: 'What the Directions button searches for. Leave empty to use the address.' },
                        { kind: 'image', key: 'image', label: 'Outlet photo' },
                        {
                            kind: 'list', key: 'hours', label: 'Opening hours', itemLabel: 'set of hours', max: 7,
                            newItem: { days: [], opens: '12:00', closes: '23:00' },
                            fields: [
                                { kind: 'checks', key: 'days', label: 'Days', options: DAY_OPTIONS },
                                { kind: 'time', key: 'opens', label: 'Opens' },
                                { kind: 'time', key: 'closes', label: 'Closes' },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};

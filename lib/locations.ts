/**
 * The three rooms - the DEFAULT outlet data.
 *
 * ⚠ The live list is edited in Admin -> Locations and stored in the CMS. This
 * array only seeds it (lib/cms/schema.ts) and is what renders until the
 * client publishes their own. The Locations chapter, the footer and the
 * Restaurant JSON-LD all read the CMS copy.
 *
 * NAP consistency still matters as much as ever: name, address and phone must
 * match the Google Business Profile character for character - now in the
 * admin form rather than here.
 */
export interface Location {
    /** Branch name, as it appears on the Google Business Profile. */
    name: string;
    address: string;
    /** Digits only, no `+`, for wa.me links. */
    whatsapp: string;
    /** E.164, for `tel:` hrefs. */
    tel: string;
    /** Human-readable, for display. */
    phoneDisplay: string;
    hours: string[];
    /** Machine-readable hours for schema.org openingHoursSpecification. */
    openingHours: { days: string[]; opens: string; closes: string }[];
    imageSrc: string;
    mapQuery: string;
}

export const LOCATIONS: Location[] = [
    {
        name: 'Gulshan 1',
        address: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka 1212',
        whatsapp: '8801600068193',
        tel: '+8801600068193',
        phoneDisplay: '+880 1600-068193',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        openingHours: [
            { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '12:00', closes: '23:00' },
            { days: ['Friday'], opens: '14:00', closes: '23:00' },
        ],
        imageSrc: '/assets/Location_Image_1_1/Gulshan_Outlet_2.webp',
        mapQuery: 'Level 1, Progress Tower, House 1, Road 23, Gulshan 1, Dhaka',
    },
    {
        name: 'Dhanmondi',
        address: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
        whatsapp: '8801603523731',
        tel: '+8801603523731',
        phoneDisplay: '+880 1603-523731',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        openingHours: [
            { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '12:00', closes: '23:00' },
            { days: ['Friday'], opens: '14:00', closes: '23:00' },
        ],
        imageSrc: '/assets/Location_Image_1_1/Dhanmondi_Outlet_1.webp',
        mapQuery: 'Ahmad & Kazi Tower, Level-5, House-35, Road-2, Dhanmondi, Dhaka',
    },
    {
        name: 'Uttara',
        address: 'House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka',
        whatsapp: '8801627167758',
        tel: '+8801627167758',
        phoneDisplay: '+880 1627-167758',
        hours: ['Sat–Thu: 12:00 PM – 11:00 PM', 'Friday: 2:00 PM – 11:00 PM'],
        openingHours: [
            { days: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'], opens: '12:00', closes: '23:00' },
            { days: ['Friday'], opens: '14:00', closes: '23:00' },
        ],
        imageSrc: '/assets/Location_Image_1_1/Uttara_Outlet_3.webp',
        mapQuery: 'House 30, Tropical Sormi Center, Sector 13, Garib-E-Newaz Ave, Uttara, Dhaka',
    },
];

/** The number the site's general "contact us" actions reach. */
export const PRIMARY_WHATSAPP = '8801600068193';

export const waLink = (message: string, number: string = PRIMARY_WHATSAPP) =>
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const mapLink = (query: string) =>
    `https://maps.google.com/?q=${encodeURIComponent(query)}`;

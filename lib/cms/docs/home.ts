import { bg, EMPTY_BACKGROUND, linkField, type Background, type CmsLink, type DocDef, type Field, type Option } from '../fields';

/**
 * The homepage, chapter by chapter. Defaults are exactly what the page showed
 * before the CMS existed, so an empty database renders the site unchanged.
 *
 * Section keys are stable ids - they are stored in `sectionOrder` and in every
 * published version, so renaming one orphans that section's saved content.
 * Change the `title`, never the `key`.
 */

export const BADGE_OPTIONS: Option[] = [
    { value: 'spicy', label: 'Spicy' },
    { value: 'featured', label: 'Featured' },
    { value: 'special', label: "Chef's special" },
    { value: 'new', label: 'New' },
];

export interface Photo { src: string; alt: string }
export interface SignatureDish { image: string; name: string; blurb: string; href: string; badges: string[] }

export interface HomeContent {
    sectionOrder: string[];
    hero: {
        visible: boolean;
        background: Background;
        logo: string;
        logoAlt: string;
        eyebrow: string;
        title: string;
        primaryButton: CmsLink;
        secondaryButton: CmsLink;
        showDivider: boolean;
        dividerColor: 'saffron' | 'terracotta';
    };
    craft: {
        visible: boolean;
        background: Background;
        video: string;
        poster: string;
        heading: string;
        body: string;
        button: CmsLink;
    };
    story: {
        visible: boolean;
        background: Background;
        quote: string;
        gallery: Photo[];
        button: CmsLink;
        signatureHeading: string;
        dishes: SignatureDish[];
    };
    locations: {
        visible: boolean;
        background: Background;
        heading: string;
        intro: string;
        contactLabel: string;
        contactMessage: string;
        directionsLabel: string;
    };
    gift: {
        visible: boolean;
        background: Background;
        heading: string;
        lede: string;
        buyButton: CmsLink;
        detailsButtonLabel: string;
        detailsTitle: string;
        details: { label: string; value: string }[];
        backCard: Photo;
        frontCard: Photo;
        brush: string;
    };
    invitation: {
        visible: boolean;
        background: Background;
        heading: string;
        button: CmsLink;
    };
}

const wa = (label: string, message: string): CmsLink => ({ label, type: 'whatsapp', url: '', message });
const page = (label: string, url: string): CmsLink => ({ label, type: 'url', url, message: '' });

export const homeDefaults: HomeContent = {
    sectionOrder: ['hero', 'craft', 'story', 'locations', 'gift', 'invitation'],
    hero: {
        visible: true,
        background: {
            ...EMPTY_BACKGROUND,
            video: '/assets/video-web/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.mp4',
            poster: '/assets/posters/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.webp',
        },
        logo: '/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp',
        logoAlt: 'Khao San',
        eyebrow: 'Reinventing',
        title: 'The Thai Way',
        primaryButton: wa('Book A Table', "Hi, I'd like to reserve a table at Khao San."),
        secondaryButton: page('Explore Menu', '/menu'),
        showDivider: true,
        dividerColor: 'saffron',
    },
    craft: {
        visible: true,
        background: { ...EMPTY_BACKGROUND },
        video: '/assets/video-web/theatre-craft.mp4',
        poster: '/assets/posters/theatre-craft.webp',
        heading: 'The Theatre of Fire.',
        body: 'Our woks are fueled by raw heat and culinary discipline. By tossing fresh ingredients at extreme temperatures, we achieve a charred, complex caramelization that defines the soul of authentic street craft.',
        button: page('See the Menu', '/menu'),
    },
    story: {
        visible: true,
        background: { ...EMPTY_BACKGROUND },
        quote: 'Bangkok, *quietly elevated.*',
        gallery: [
            { src: '/assets/interiors/gulshan/tuktuk-booth.webp', alt: 'The blue tuk-tuk booth under caged pendant lamps, beside patterned banquette seating' },
            { src: '/assets/interiors/dhanmondi/tables-palm.webp', alt: 'Timber tables with orange and grey chairs, set against dense planting' },
            { src: '/assets/Heritage/neon-market.webp', alt: 'Hand-bent neon signs - Night Market, Khao San, Tom Yum, Tuk Tuk - above the tuk-tuk booth' },
            { src: '/assets/Heritage/rocco-street.webp', alt: 'A painted Bangkok street scene with the Rocco sign glowing over the shopfronts' },
            { src: '/assets/interiors/dhanmondi/mural-glass.webp', alt: 'Tropical mural painted across the glass partition, with the dining room beyond' },
            { src: '/assets/interiors/uttara/dining-floor.webp', alt: 'Orange chairs and timber tables on the oak floor, framed by potted greenery' },
            { src: '/assets/interiors/gulshan/banquette.webp', alt: 'Solid timber tables and grey banquette seating, set with daisies' },
            { src: '/assets/Heritage/elephant-mark.webp', alt: 'The painted elephant, our mark, on the jungle mural wall' },
            { src: '/assets/interiors/uttara/pendants.webp', alt: 'The neon signage wall and jungle mural seen past the pendant lighting rig' },
        ],
        button: page('Explore the Menu', '/menu'),
        signatureHeading: 'Signature Spreads.',
        dishes: [
            {
                image: '/assets/menu-plated/B. Soups/Tom Yum Goong.webp',
                name: 'Tom Yum Goong',
                blurb: 'River prawns in a clear, sour-hot broth of lemongrass, galangal and lime leaf - hand-crushed to order.',
                href: '/menu#b-soups',
                badges: ['spicy', 'featured'],
            },
            {
                image: '/assets/menu-plated/E. Noodles/Pad Thai.webp',
                name: 'Pad Thai',
                blurb: 'Rice noodles tossed in high wok fire with tamarind, peanut and baked tofu.',
                href: '/menu#e-noodles',
                badges: ['featured'],
            },
            {
                image: '/assets/menu-plated/G. Chicken/Chicken Penang Curry.webp',
                name: 'Chicken Penang Curry',
                blurb: 'A thick, fragrant curry of roasted peanut and coconut cream, finished with sweet basil.',
                href: '/menu#g-chicken',
                badges: ['special'],
            },
        ],
    },
    locations: {
        visible: true,
        background: { ...EMPTY_BACKGROUND },
        heading: 'Our Locations.',
        intro: 'Three deeply atmospheric dining rooms across Dhaka. Find your nearest.',
        contactLabel: 'Contact Us',
        contactMessage: "Hi, I'd like to get in touch with Khao San {outlet}.",
        directionsLabel: 'Directions',
    },
    gift: {
        visible: true,
        background: { ...EMPTY_BACKGROUND },
        heading: 'An evening, *Gifted.*',
        lede: 'The perfect present for special occasions, a Khao San gift card unlocks the full menu across all three outlets. Delivered digitally, redeemable instantly.',
        buyButton: wa('Buy a Gift Card →', "Hi, I'd like to purchase a Khao San gift card."),
        detailsButtonLabel: 'Details',
        detailsTitle: 'Gift card details',
        details: [
            { label: 'Denominations', value: '1,500 & 3,000 BDT' },
            { label: 'Redeemable at', value: 'Gulshan · Dhanmondi · Uttara' },
            { label: 'Delivery', value: 'Digital, with a personalised note' },
            { label: 'Validity', value: 'No expiry, no hidden fees' },
        ],
        backCard: { src: '/assets/Giftcards-20260709T183548Z-2-001/Giftcards/1500Tk Front.webp', alt: '1500 BDT Gift Card' },
        frontCard: { src: '/assets/Giftcards-20260709T183548Z-2-001/Giftcards/3000Tk Front.webp', alt: '3000 BDT Gift Card' },
        brush: '/assets/brush-strokes/saffron.png',
    },
    invitation: {
        visible: true,
        /* The designed ground (lotus photo under a slate wash) is drawn by
           the component whenever no colour or photo is set here - see
           components/home-page.tsx. Only the film is a default value. */
        background: {
            ...EMPTY_BACKGROUND,
            video: '/assets/video-web/closing-table.mp4',
            poster: '/assets/posters/closing-table.webp',
            videoOpacity: 75,
        },
        heading: 'Taste the fire.',
        button: wa('Contact Us →', "Hi, I'd like to get in touch with Khao San."),
    },
};

const photoFields: Field[] = [
    { kind: 'image', key: 'src', label: 'Photo' },
    { kind: 'text', key: 'alt', label: 'Description (for screen readers and Google)', maxLength: 300 },
];

export const homeDoc: DocDef = {
    key: 'home',
    title: 'Homepage',
    description: 'Every section of the homepage: what it says, the photos and videos in it, its background, and the order the sections appear in.',
    previewPath: '/',
    orderable: true,
    sections: [
        {
            key: 'hero',
            title: 'Opening (hero)',
            description: 'The full-screen first view with the video, logo and two buttons.',
            hideable: true,
            fields: [
                { ...bg(true, 'Background video / photo'), help: 'The hero plays this video behind the logo. Replace it with another video, or remove the video and use a photo or colour instead.' },
                { kind: 'image', key: 'logo', label: 'Logo', help: 'Use a PNG or WebP with a transparent background. It is shown in white.' },
                { kind: 'text', key: 'logoAlt', label: 'Logo description', maxLength: 120 },
                { kind: 'text', key: 'eyebrow', label: 'Small line above the title', maxLength: 80 },
                { kind: 'text', key: 'title', label: 'Title', maxLength: 120, help: 'Set in the brush lettering.' },
                linkField('primaryButton', 'Main button'),
                linkField('secondaryButton', 'Second button'),
                { kind: 'toggle', key: 'showDivider', label: 'Show the brush stroke under this section' },
                { kind: 'select', key: 'dividerColor', label: 'Brush stroke colour', options: [{ value: 'saffron', label: 'Saffron' }, { value: 'terracotta', label: 'Terracotta' }] },
            ],
        },
        {
            key: 'craft',
            title: 'The Theatre of Fire',
            description: 'Video on one side, heading, text and a button on the other.',
            hideable: true,
            fields: [
                bg(),
                { kind: 'video', key: 'video', label: 'Video in the frame' },
                { kind: 'image', key: 'poster', label: 'Still shown while the video loads' },
                { kind: 'text', key: 'heading', label: 'Heading', maxLength: 120 },
                { kind: 'text', key: 'body', label: 'Text', multiline: true, maxLength: 1200 },
                linkField('button', 'Button'),
            ],
        },
        {
            key: 'story',
            title: 'Our rooms & signature dishes',
            description: 'The quote, the sideways photo gallery of the rooms, and the three signature dish rows. One section so the background runs unbroken behind both.',
            hideable: true,
            fields: [
                bg(),
                { kind: 'text', key: 'quote', label: 'Quote', rich: true, maxLength: 200 },
                {
                    kind: 'list', key: 'gallery', label: 'Room gallery', itemLabel: 'photo', titleKey: 'alt', max: 30,
                    help: 'Shown in groups of three: one large photo, then two stacked beside it.',
                    newItem: { src: '', alt: '' },
                    fields: [...photoFields],
                },
                linkField('button', 'Button under the gallery'),
                { kind: 'text', key: 'signatureHeading', label: 'Signature dishes heading', maxLength: 120 },
                {
                    kind: 'list', key: 'dishes', label: 'Signature dishes', itemLabel: 'dish', titleKey: 'name', max: 8,
                    newItem: { image: '', name: 'New dish', blurb: '', href: '/menu', badges: [] },
                    fields: [
                        { kind: 'image', key: 'image', label: 'Dish photo' },
                        { kind: 'text', key: 'name', label: 'Dish name', maxLength: 120 },
                        { kind: 'text', key: 'blurb', label: 'Short description', multiline: true, maxLength: 400 },
                        { kind: 'text', key: 'href', label: 'Links to', maxLength: 300, help: 'Usually the menu at that dish\'s category, e.g. /menu#b-soups.' },
                        { kind: 'checks', key: 'badges', label: 'Badges', options: BADGE_OPTIONS },
                    ],
                },
            ],
        },
        {
            key: 'locations',
            title: 'Our Locations',
            description: 'The outlet cards. Addresses, phones, hours and photos are edited under Locations & hours.',
            hideable: true,
            fields: [
                bg(),
                { kind: 'text', key: 'heading', label: 'Heading', maxLength: 120 },
                { kind: 'text', key: 'intro', label: 'Intro line', multiline: true, maxLength: 400 },
                { kind: 'text', key: 'contactLabel', label: 'Contact button text', maxLength: 40 },
                { kind: 'text', key: 'contactMessage', label: 'Contact button WhatsApp message', maxLength: 300, help: '{outlet} is replaced with the outlet name.' },
                { kind: 'text', key: 'directionsLabel', label: 'Directions button text', maxLength: 40 },
            ],
        },
        {
            key: 'gift',
            title: 'Gift cards',
            hideable: true,
            fields: [
                bg(),
                { kind: 'text', key: 'heading', label: 'Heading', rich: true, maxLength: 120 },
                { kind: 'text', key: 'lede', label: 'Text', multiline: true, maxLength: 800 },
                linkField('buyButton', 'Buy button'),
                { kind: 'text', key: 'detailsButtonLabel', label: 'Details button text', maxLength: 40 },
                { kind: 'text', key: 'detailsTitle', label: 'Details panel title', maxLength: 80 },
                {
                    kind: 'list', key: 'details', label: 'Details panel rows', itemLabel: 'row', titleKey: 'label', max: 12,
                    newItem: { label: '', value: '' },
                    fields: [
                        { kind: 'text', key: 'label', label: 'Label', maxLength: 60 },
                        { kind: 'text', key: 'value', label: 'Value', maxLength: 200 },
                    ],
                },
                { kind: 'group', key: 'frontCard', label: 'Front card (top, tilted left)', fields: [...photoFields] },
                { kind: 'group', key: 'backCard', label: 'Back card (behind, tilted right)', fields: [...photoFields] },
                { kind: 'image', key: 'brush', label: 'Brush stroke behind the cards', help: 'A transparent PNG works best. Remove it to show the cards on their own.' },
            ],
        },
        {
            key: 'invitation',
            title: 'Closing banner',
            description: 'The last section before the footer: a line set in brush lettering over video, and a button.',
            hideable: true,
            fields: [
                bg(),
                { kind: 'text', key: 'heading', label: 'Line', maxLength: 120 },
                linkField('button', 'Button'),
            ],
        },
    ],
};

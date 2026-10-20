/**
 * Everything the client can edit, and what it is when they have not.
 *
 * The defaults below ARE the site as it was built and signed off - copied out
 * of the components character for character. With an empty database the site
 * renders exactly as before the CMS existed, and any document or field the
 * client has never touched keeps rendering its default.
 *
 * Keys of `DOCS` are stored in the database (`cms_drafts.key`,
 * `cms_published.key`). Never rename one - add a migration instead.
 */
import { f, section, type Fields, type FieldsValue } from './fields';
import { LOCATIONS } from '@/lib/locations';

/* ------------------------------------------------------------------ */
/* Shared building blocks                                               */
/* ------------------------------------------------------------------ */

interface CtaDefaults {
    action?: 'link' | 'whatsapp';
    href?: string;
    message?: string;
    style?: 'primary' | 'secondary';
    label?: string;
}

/** A button: its text, what it does, and how it looks. */
export const cta = (text: string, o: CtaDefaults = {}) => f.object({
    label: o.label ?? 'Button',
    fields: {
        label: f.text({ label: 'Button text', default: text, help: 'Leave empty to hide this button.' }),
        action: f.select({
            label: 'When clicked',
            options: [
                { value: 'link', label: 'Go to a page or web address' },
                { value: 'whatsapp', label: 'Open a WhatsApp chat' },
            ],
            default: o.action ?? 'link',
        }),
        href: f.href({
            label: 'Link',
            default: o.href ?? '',
            placeholder: '/menu',
            help: 'A page on this site (/menu, /#locations) or a full web address (https://...).',
            showIf: s => s.action === 'link',
        }),
        message: f.text({
            label: 'Pre-filled WhatsApp message',
            default: o.message ?? '',
            multiline: true,
            showIf: s => s.action === 'whatsapp',
        }),
        whatsapp: f.text({
            label: 'WhatsApp number (optional)',
            placeholder: '8801XXXXXXXXX',
            help: 'Digits only, with country code. Leave empty to use the main number from Site settings.',
            showIf: s => s.action === 'whatsapp',
        }),
        style: f.select({
            label: 'Button colour',
            options: [
                { value: 'primary', label: 'Orange (main action)' },
                { value: 'secondary', label: 'Light blue (secondary)' },
            ],
            default: o.style ?? 'primary',
        }),
    },
});
export type CtaValue = FieldsValue<ReturnType<typeof cta>['fields']>;

const link = (label: string, href: string) => ({ label, href });
const linkItem = {
    label: f.text({ label: 'Text' }),
    href: f.href({ label: 'Link', placeholder: '/menu' }),
};

const BADGE_OPTIONS = [
    { value: 'spicy', label: 'Spicy' },
    { value: 'special', label: "Chef's Special" },
    { value: 'featured', label: 'Signature' },
    { value: 'new', label: 'New' },
] as const;

const backgroundChoice = (fallback: 'white' | 'tint' | 'blue') => f.select({
    label: 'Background',
    options: [
        { value: 'white', label: 'White' },
        { value: 'tint', label: 'Soft blue-white' },
        { value: 'blue', label: 'Brand blue with lotus art' },
    ],
    default: fallback,
});

const galleryShot = {
    image: f.image({ label: 'Photo' }),
};

const featureDish = {
    image: f.image({ label: 'Photo', noAlt: true, help: 'The dish name is used as the description.' }),
    name: f.text({ label: 'Dish name' }),
    blurb: f.text({ label: 'Short description', multiline: true }),
    href: f.href({ label: 'Link', default: '/menu', help: 'Usually a menu category, e.g. /menu#b-soups' }),
    badges: f.tags({ label: 'Marks', options: BADGE_OPTIONS, default: [] }),
};

const LOGO = '/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp';

/* ------------------------------------------------------------------ */
/* Homepage section types                                               */
/* ------------------------------------------------------------------ */

export const SECTION_TYPES = {
    hero: section({
        label: 'Hero (full-screen video)',
        description: 'The opening screen: logo, headline and two buttons over full-bleed video.',
        fields: {
            logo: f.image({ label: 'Logo', src: LOGO, alt: 'Khao San', help: 'Shown in white. Use a transparent PNG or WebP.' }),
            eyebrow: f.text({ label: 'Small line above the headline', default: 'Reinventing' }),
            title: f.text({ label: 'Headline', default: 'The Thai Way' }),
            video: f.video({
                label: 'Background video',
                src: '/assets/video-web/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.mp4',
                poster: '/assets/posters/Khao_San_Thoughtful_interiors_fl_1602693357399955_720p_20260706.webp',
                help: 'MP4, ideally under 2 MB. The poster image shows while it loads.',
            }),
            primary: cta('Book A Table', { label: 'Main button', action: 'whatsapp', message: "Hi, I'd like to reserve a table at Khao San." }),
            secondary: cta('Explore Menu', { label: 'Second button', href: '/menu', style: 'secondary' }),
        },
    }),
    brush: section({
        label: 'Brush-stroke divider',
        description: 'A hand-painted brush stroke that sweeps across as the visitor scrolls past.',
        fields: {
            color: f.select({
                label: 'Brush colour',
                options: [{ value: 'saffron', label: 'Saffron' }, { value: 'terracotta', label: 'Terracotta' }],
                default: 'saffron',
            }),
        },
    }),
    craft: section({
        label: 'Video / photo with text',
        description: 'A large video or photo beside a heading, a paragraph and a button.',
        fields: {
            background: backgroundChoice('blue'),
            video: f.video({ label: 'Video', src: '/assets/video-web/theatre-craft.mp4', poster: '/assets/posters/theatre-craft.webp', help: 'Leave the video empty to show the photo below instead.' }),
            image: f.image({ label: 'Photo (used when there is no video)' }),
            heading: f.text({ label: 'Heading', default: 'The Theatre of Fire.' }),
            body: f.text({
                label: 'Paragraph',
                multiline: true,
                inline: true,
                default: 'Our woks are fueled by raw heat and culinary discipline. By tossing fresh ingredients at extreme temperatures, we achieve a charred, complex caramelization that defines the soul of authentic street craft.',
            }),
            button: cta('See the Menu', { href: '/menu' }),
        },
    }),
    heritage: section({
        label: 'Story, room gallery & signature dishes',
        description: 'A quote, a sideways-scrolling gallery of the rooms, a button, then the signature dish rows - all on one continuous background.',
        fields: {
            quote: f.text({ label: 'Quote', inline: true, default: 'Bangkok, *quietly elevated.*', help: 'Wrap words in *asterisks* for the coloured italic.' }),
            showGallery: f.toggle({ label: 'Show the room gallery', default: true }),
            galleryLabel: f.text({ label: 'Gallery description (for screen readers)', default: 'Inside our rooms' }),
            gallery: f.list({
                label: 'Gallery photos',
                itemName: 'photo',
                help: 'Photos are grouped in threes: one large, two stacked. Drag to reorder.',
                item: galleryShot,
                default: [
                    { image: { src: '/assets/interiors/gulshan/tuktuk-booth.webp', alt: 'The blue tuk-tuk booth under caged pendant lamps, beside patterned banquette seating' } },
                    { image: { src: '/assets/interiors/dhanmondi/tables-palm.webp', alt: 'Timber tables with orange and grey chairs, set against dense planting' } },
                    { image: { src: '/assets/Heritage/neon-market.webp', alt: 'Hand-bent neon signs - Night Market, Khao San, Tom Yum, Tuk Tuk - above the tuk-tuk booth' } },
                    { image: { src: '/assets/Heritage/rocco-street.webp', alt: 'A painted Bangkok street scene with the Rocco sign glowing over the shopfronts' } },
                    { image: { src: '/assets/interiors/dhanmondi/mural-glass.webp', alt: 'Tropical mural painted across the glass partition, with the dining room beyond' } },
                    { image: { src: '/assets/interiors/uttara/dining-floor.webp', alt: 'Orange chairs and timber tables on the oak floor, framed by potted greenery' } },
                    { image: { src: '/assets/interiors/gulshan/banquette.webp', alt: 'Solid timber tables and grey banquette seating, set with daisies' } },
                    { image: { src: '/assets/Heritage/elephant-mark.webp', alt: 'The painted elephant, our mark, on the jungle mural wall' } },
                    { image: { src: '/assets/interiors/uttara/pendants.webp', alt: 'The neon signage wall and jungle mural seen past the pendant lighting rig' } },
                ],
            }),
            button: cta('Explore the Menu', { href: '/menu', style: 'secondary' }),
            showDishes: f.toggle({ label: 'Show the signature dishes', default: true }),
            dishesHeading: f.text({ label: 'Signature dishes heading', default: 'Signature Spreads.' }),
            dishLinkLabel: f.text({ label: 'Dish link text', default: 'View Menu' }),
            dishes: f.list({
                label: 'Signature dishes',
                itemName: 'dish',
                summaryKey: 'name',
                item: featureDish,
                default: [
                    { image: { src: '/assets/menu-plated/B. Soups/Tom Yum Goong.webp' }, name: 'Tom Yum Goong', blurb: 'River prawns in a clear, sour-hot broth of lemongrass, galangal and lime leaf - hand-crushed to order.', href: '/menu#b-soups', badges: ['spicy', 'featured'] },
                    { image: { src: '/assets/menu-plated/E. Noodles/Pad Thai.webp' }, name: 'Pad Thai', blurb: 'Rice noodles tossed in high wok fire with tamarind, peanut and baked tofu.', href: '/menu#e-noodles', badges: ['featured'] },
                    { image: { src: '/assets/menu-plated/G. Chicken/Chicken Penang Curry.webp' }, name: 'Chicken Penang Curry', blurb: 'A thick, fragrant curry of roasted peanut and coconut cream, finished with sweet basil.', href: '/menu#g-chicken', badges: ['special'] },
                ],
            }),
        },
    }),
    locations: section({
        label: 'Locations',
        description: 'A card for every outlet. The outlets themselves are edited under Locations.',
        fields: {
            heading: f.text({ label: 'Heading', default: 'Our Locations.' }),
            intro: f.text({ label: 'Intro line', multiline: true, default: 'Three deeply atmospheric dining rooms across Dhaka. Find your nearest.' }),
            contactLabel: f.text({ label: 'Contact button text', default: 'Contact Us' }),
            contactMessage: f.text({
                label: 'Pre-filled WhatsApp message',
                multiline: true,
                default: "Hi, I'd like to get in touch with Khao San {name}.",
                help: '{name} is replaced with the outlet name. Each card opens that outlet\'s own WhatsApp.',
            }),
            directionsLabel: f.text({ label: 'Directions button text', default: 'Directions' }),
        },
    }),
    gift: section({
        label: 'Gift cards',
        description: 'Heading, text, details panel and the two gift card images on a brush stroke.',
        fields: {
            heading: f.text({ label: 'Heading', inline: true, default: 'An evening, *Gifted.*', help: 'Wrap words in *asterisks* for the coloured italic.' }),
            lede: f.text({
                label: 'Paragraph',
                multiline: true,
                inline: true,
                default: 'The perfect present for special occasions, a Khao San gift card unlocks the full menu across all three outlets. Delivered digitally, redeemable instantly.',
            }),
            button: cta('Buy a Gift Card →', { action: 'whatsapp', message: "Hi, I'd like to purchase a Khao San gift card." }),
            detailsLabel: f.text({ label: 'Details button text', default: 'Details', help: 'Leave empty to hide the details panel.' }),
            detailsTitle: f.text({ label: 'Details panel title', default: 'Gift card details' }),
            details: f.list({
                label: 'Details rows',
                itemName: 'row',
                summaryKey: 'label',
                item: { label: f.text({ label: 'Label' }), value: f.text({ label: 'Value' }) },
                default: [
                    { label: 'Denominations', value: '1,500 & 3,000 BDT' },
                    { label: 'Redeemable at', value: 'Gulshan · Dhanmondi · Uttara' },
                    { label: 'Delivery', value: 'Digital, with a personalised note' },
                    { label: 'Validity', value: 'No expiry, no hidden fees' },
                ],
            }),
            frontCard: f.image({ label: 'Front card image', src: '/assets/Giftcards-20260709T183548Z-2-001/Giftcards/3000Tk Front.webp', alt: '3000 BDT Gift Card' }),
            backCard: f.image({ label: 'Back card image', src: '/assets/Giftcards-20260709T183548Z-2-001/Giftcards/1500Tk Front.webp', alt: '1500 BDT Gift Card' }),
            showBrush: f.toggle({ label: 'Show the brush stroke behind the cards', default: true }),
        },
    }),
    invitation: section({
        label: 'Closing banner (video)',
        description: 'A final headline and button over full-width video.',
        fields: {
            heading: f.text({ label: 'Headline', default: 'Taste the fire.' }),
            brushFont: f.toggle({ label: 'Use the brush lettering', default: true }),
            background: f.image({ label: 'Background image', noAlt: true, src: '/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Lotus background.webp' }),
            video: f.video({ label: 'Video', src: '/assets/video-web/closing-table.mp4', poster: '/assets/posters/closing-table.webp' }),
            button: cta('Contact Us →', { action: 'whatsapp', message: "Hi, I'd like to get in touch with Khao San." }),
        },
    }),
    text: section({
        label: 'Text block',
        description: 'A heading, a paragraph and an optional button.',
        fields: {
            background: backgroundChoice('white'),
            align: f.select({ label: 'Alignment', options: [{ value: 'center', label: 'Centred' }, { value: 'left', label: 'Left' }], default: 'center' }),
            heading: f.text({ label: 'Heading', inline: true, default: 'A new chapter.' }),
            body: f.text({ label: 'Paragraph', multiline: true, inline: true, default: 'Write something here.' }),
            button: cta('', { href: '/menu' }),
        },
    }),
    gallery: section({
        label: 'Photo gallery',
        description: 'A sideways-scrolling strip of photos with an optional heading.',
        fields: {
            background: backgroundChoice('white'),
            heading: f.text({ label: 'Heading', inline: true }),
            label: f.text({ label: 'Gallery description (for screen readers)', default: 'Photo gallery' }),
            photos: f.list({ label: 'Photos', itemName: 'photo', item: galleryShot }),
        },
    }),
    dishes: section({
        label: 'Dish highlights',
        description: 'Alternating photo-and-text rows for chosen dishes.',
        fields: {
            heading: f.text({ label: 'Heading', default: 'From the kitchen.' }),
            linkLabel: f.text({ label: 'Dish link text', default: 'View Menu' }),
            dishes: f.list({ label: 'Dishes', itemName: 'dish', summaryKey: 'name', item: featureDish }),
        },
    }),
};

export type SectionTypeKey = keyof typeof SECTION_TYPES;

/* ------------------------------------------------------------------ */
/* Documents                                                            */
/* ------------------------------------------------------------------ */

const fontChoice = (label: string) => f.object({
    label,
    fields: {
        source: f.select({
            label: 'Font',
            options: [
                { value: 'default', label: 'Built-in brand font' },
                { value: 'google', label: 'A Google Font' },
                { value: 'upload', label: 'Upload a font file' },
            ],
            default: 'default',
        }),
        family: f.text({
            label: 'Font name',
            placeholder: 'Playfair Display',
            help: 'For Google Fonts, type the name exactly as fonts.google.com shows it.',
            showIf: s => s.source === 'google',
        }),
        file: f.font({ label: 'Font file (.woff2, .woff, .ttf or .otf)', showIf: s => s.source === 'upload' }),
    },
});

const legalDoc = (title: string, metaDescription: string, lastUpdated: string, blocks: unknown[]) => ({
    title: f.text({ label: 'Page title', default: title }),
    metaTitle: f.text({ label: 'Browser tab / Google title', default: `${title} | Khao San` }),
    metaDescription: f.text({ label: 'Google description', multiline: true, default: metaDescription }),
    backLabel: f.text({ label: 'Back link text', default: '← Back to Home' }),
    blocks: f.list({
        label: 'Content',
        itemName: 'block',
        summaryKey: 'text',
        help: 'Paragraph text supports *italic*, **bold** and [link text](https://...).',
        item: {
            kind: f.select({
                label: 'Type',
                options: [
                    { value: 'heading', label: 'Heading' },
                    { value: 'paragraph', label: 'Paragraph' },
                    { value: 'bullets', label: 'Bullet list' },
                ],
                default: 'paragraph',
            }),
            text: f.text({ label: 'Text', multiline: true, inline: true, showIf: s => s.kind !== 'bullets' }),
            items: f.strings({ label: 'Bullet points', itemName: 'point', showIf: s => s.kind === 'bullets' }),
        },
        default: blocks,
    }),
    lastUpdated: f.text({ label: 'Last updated line', default: lastUpdated }),
});

const h = (text: string) => ({ kind: 'heading', text });
const p = (text: string) => ({ kind: 'paragraph', text });

export const DOC_FIELDS = {
    site: {
        siteName: f.text({ label: 'Restaurant name', default: 'Khao San' }),
        siteUrl: f.href({ label: 'Website address', default: 'https://khaosan.com.bd', help: 'Used for Google, social sharing and the sitemap. Include https://.' }),
        logo: f.image({ label: 'Logo', src: LOGO, alt: 'Khao San', help: 'Used in the header and footer. A transparent PNG or WebP of the navy mark.' }),
        favicon: f.image({ label: 'Browser tab icon', noAlt: true, src: '/assets/Logos-20260709T183558Z-2-001/Logos/Dark Blue.webp' }),
        whatsapp: f.text({ label: 'Main WhatsApp number', default: '8801600068193', help: 'Digits only, with country code. Every "Contact" button uses this unless it has its own.' }),
        seo: f.object({
            label: 'Google & social sharing',
            fields: {
                title: f.text({ label: 'Homepage title (browser tab & Google)', default: 'Khao San | The Thai Way in Dhaka' }),
                description: f.text({ label: 'Google description', multiline: true, default: 'Experience the uncompromising standard of authentic Thai Street Food at Khao San Dhaka. A curated dining experience in Gulshan, Dhanmondi, and Uttara.' }),
                keywords: f.strings({ label: 'Keywords', itemName: 'keyword', default: ['Thai Food Dhaka', 'Khao San', 'Best Thai Restaurant', 'Fine Dining', 'Tom Yum Goong', 'Pad Thai', 'Gulshan Restaurant'] }),
                shareTitle: f.text({ label: 'Title when shared on social media', default: 'Khao San | The Thai Way' }),
                shareDescription: f.text({ label: 'Description when shared on Facebook/WhatsApp', multiline: true, default: 'An evening of unforgettable Thai hospitality. Experience the uncompromising standard of authentic Thai cuisine in Dhaka.' }),
                shareDescriptionShort: f.text({ label: 'Description when shared on X/Twitter', multiline: true, default: 'Experience the uncompromising standard of authentic Thai cuisine in Dhaka.' }),
                shareImage: f.image({ label: 'Image when shared (1200×630 or larger)', src: '/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Elephant 16 by 9 Ratio Landscape.webp', alt: 'Khao San Restaurant' }),
            },
        }),
        intro: f.toggle({ label: 'Play the logo intro on a visitor\'s first homepage visit', default: true }),
    },

    theme: {
        colors: f.object({
            label: 'Colours',
            fields: {
                orange: f.color({ label: 'Brand orange (main buttons)', default: '#ff964f' }),
                blue: f.color({ label: 'Brand blue (headings, blue sections)', default: '#1e417b' }),
                butter: f.color({ label: 'Butter (accents on blue)', default: '#f9eb9b' }),
                powder: f.color({ label: 'Powder blue (secondary buttons)', default: '#cadbe9' }),
                text: f.color({ label: 'Body text', default: '#161616' }),
                textSecondary: f.color({ label: 'Secondary text', default: '#55606e' }),
                surface: f.color({ label: 'Page background', default: '#ffffff' }),
            },
        }),
        fonts: f.object({
            label: 'Fonts',
            fields: {
                display: fontChoice('Headings (currently Camera Obscura)'),
                script: fontChoice('Brush lettering (currently Good Brush)'),
                body: fontChoice('Body text & buttons (currently Montserrat)'),
            },
        }),
        backgrounds: f.object({
            label: 'Background artwork',
            fields: {
                blueField: f.image({ label: 'Blue sections (lotus art under a blue wash)', noAlt: true, src: '/assets/bg-web/lotus-background.webp', help: 'Leave empty for plain blue.' }),
                giftField: f.image({ label: 'Gift card section (lotus corner bloom)', noAlt: true, src: '/assets/Background-20260709T183540Z-2-001/Background/Lotus/Lotus.webp', help: 'Leave empty for plain white.' }),
                footer: f.image({ label: 'Footer (under a dark wash)', noAlt: true, src: '/assets/bg-web/elephant-landscape.webp', help: 'Leave empty for plain dark navy.' }),
            },
        }),
    },

    navigation: {
        header: f.object({
            label: 'Header',
            fields: {
                links: f.list({
                    label: 'Menu links',
                    itemName: 'link',
                    summaryKey: 'label',
                    item: linkItem,
                    default: [link('Menu', '/menu'), link('Locations', '/#locations'), link('Our Story', '/#heritage'), link('Gift Cards', '/#gift')],
                    help: 'Use /#anchor to jump to a homepage section.',
                }),
                homeLabel: f.text({ label: 'Text for the link back home', default: 'Home', help: 'A link that points at the page you are already on is swapped for this one (e.g. "Menu" becomes "Home" on the menu page).' }),
                button: cta('Contact Us', { action: 'whatsapp', message: "Hi, I'd like to get in touch with Khao San." }),
            },
        }),
        footer: f.object({
            label: 'Footer',
            fields: {
                tagline: f.text({ label: 'Tagline', default: 'Reinventing the Thai way.' }),
                hours: f.strings({ label: 'Opening hours', itemName: 'line', default: ['Sat–Thu · 12pm–11pm', 'Friday · 2pm–11pm'] }),
                button: cta('Reserve a Table', { action: 'whatsapp', message: "Hi, I'd like to reserve a table at Khao San." }),
                directionsLabel: f.text({ label: 'Directions link text', default: 'Directions' }),
                links: f.list({
                    label: 'Footer links',
                    itemName: 'link',
                    summaryKey: 'label',
                    item: linkItem,
                    default: [link('Menu', '/menu'), link('Locations', '/#locations'), link('Our Story', '/#heritage'), link('Gift Cards', '/#gift')],
                }),
                social: f.list({
                    label: 'Social media',
                    itemName: 'profile',
                    summaryKey: 'platform',
                    item: {
                        platform: f.select({
                            label: 'Platform',
                            options: [
                                { value: 'instagram', label: 'Instagram' },
                                { value: 'facebook', label: 'Facebook' },
                                { value: 'tiktok', label: 'TikTok' },
                                { value: 'youtube', label: 'YouTube' },
                                { value: 'other', label: 'Other website' },
                            ],
                            default: 'instagram',
                        }),
                        href: f.href({ label: 'Profile link', placeholder: 'https://' }),
                        label: f.text({ label: 'Name (read aloud by screen readers)' }),
                    },
                    default: [
                        { platform: 'instagram', href: 'https://www.instagram.com/khaosandhaka/', label: 'Instagram' },
                        { platform: 'facebook', href: 'https://www.facebook.com/KhaoSanDhaka', label: 'Facebook' },
                    ],
                }),
                copyright: f.text({ label: 'Copyright line', default: '© {year} Khao San Dhaka. All rights reserved.', help: '{year} becomes the current year.' }),
                legal: f.list({
                    label: 'Legal links',
                    itemName: 'link',
                    summaryKey: 'label',
                    item: linkItem,
                    default: [link('Privacy Policy', '/legal/privacy'), link('Terms', '/legal/terms')],
                }),
            },
        }),
    },

    locations: {
        outlets: f.list({
            label: 'Outlets',
            itemName: 'outlet',
            summaryKey: 'name',
            help: 'Shown on the homepage, in the footer and to Google. Keep names, addresses and phone numbers identical to the Google Business Profile.',
            item: {
                name: f.text({ label: 'Outlet name' }),
                address: f.text({ label: 'Address', multiline: true }),
                image: f.image({ label: 'Photo', help: 'Leave the description empty to use "Khao San <name> dining room".' }),
                whatsapp: f.text({ label: 'WhatsApp number', placeholder: '8801XXXXXXXXX', help: 'Digits only, with country code.' }),
                tel: f.text({ label: 'Phone (for calling)', placeholder: '+8801XXXXXXXXX' }),
                phoneDisplay: f.text({ label: 'Phone (as shown)', placeholder: '+880 1XXX-XXXXXX' }),
                hours: f.strings({ label: 'Opening hours (as shown)', itemName: 'line' }),
                openingHours: f.list({
                    label: 'Opening hours (for Google)',
                    itemName: 'time slot',
                    item: {
                        days: f.tags({
                            label: 'Days',
                            options: [
                                { value: 'Saturday', label: 'Sat' }, { value: 'Sunday', label: 'Sun' },
                                { value: 'Monday', label: 'Mon' }, { value: 'Tuesday', label: 'Tue' },
                                { value: 'Wednesday', label: 'Wed' }, { value: 'Thursday', label: 'Thu' },
                                { value: 'Friday', label: 'Fri' },
                            ],
                            default: [],
                        }),
                        opens: f.text({ label: 'Opens (24h, e.g. 12:00)', default: '12:00' }),
                        closes: f.text({ label: 'Closes (24h, e.g. 23:00)', default: '23:00' }),
                    },
                }),
                mapQuery: f.text({ label: 'Google Maps search', help: 'What the Directions button searches for - usually the address.' }),
            },
            default: LOCATIONS.map(l => ({
                name: l.name,
                address: l.address,
                image: { src: l.imageSrc, alt: '' },
                whatsapp: l.whatsapp,
                tel: l.tel,
                phoneDisplay: l.phoneDisplay,
                hours: l.hours,
                openingHours: l.openingHours,
                mapQuery: l.mapQuery,
            })),
        }),
    },

    home: {
        sections: f.sections({
            label: 'Sections',
            help: 'Drag to reorder. Hide a section with the eye button to take it off the page without deleting it.',
            types: SECTION_TYPES,
            default: [
                { id: 'hero', type: 'hero' },
                { id: 'brush', type: 'brush' },
                { id: 'craft', type: 'craft' },
                { id: 'heritage', type: 'heritage', anchor: 'heritage' },
                { id: 'locations', type: 'locations', anchor: 'locations' },
                { id: 'gift', type: 'gift', anchor: 'gift' },
                { id: 'invitation', type: 'invitation' },
            ],
        }),
    },

    menu: {
        hero: f.object({
            label: 'Top of the page',
            fields: {
                video: f.video({ label: 'Background video', src: '/assets/video-web/theatre-craft.mp4', poster: '/assets/posters/theatre-craft.webp' }),
                title: f.text({ label: 'Headline', default: 'A journey through fire.' }),
                lede: f.text({ label: 'Intro', multiline: true, default: 'From fiery street-stall classics to whole-fish showpieces — every plate carries the char, spice and balance of Bangkok.' }),
                showCount: f.toggle({ label: 'Show the number of dishes', default: true }),
                countSuffix: f.text({ label: 'Text after the number', default: 'dishes' }),
            },
        }),
        showcase: f.object({
            label: 'Dish carousel',
            fields: {
                show: f.toggle({ label: 'Show the carousel', default: true }),
                title: f.text({ label: 'Heading', default: 'A taste of Khao San' }),
                exploreLabel: f.text({ label: 'Link text before the category name', default: 'Explore' }),
                hint: f.text({ label: 'Hint', default: 'Drag to discover' }),
                picks: f.list({
                    label: 'Dishes in the carousel',
                    itemName: 'dish',
                    summaryKey: 'dishTitle',
                    help: 'If a dish is renamed or removed, the category\'s Signature dish is shown instead.',
                    item: {
                        categoryId: f.select<string>({ label: 'Category', options: [], default: '', source: 'menuCategories' }),
                        dishTitle: f.text({ label: 'Dish name (exactly as on the menu)' }),
                    },
                    default: [
                        { categoryId: 'b-soups', dishTitle: 'Tom Yum Goong' },
                        { categoryId: 'e-noodles', dishTitle: 'Pad Thai' },
                        { categoryId: 'k-rice-bowls', dishTitle: 'Thai Seafood Bowl' },
                        { categoryId: 'i-seafood', dishTitle: 'Fried Whole Fish in Spicy Hot Sauce' },
                        { categoryId: 'l-desserts', dishTitle: 'Mango Sticky Rice' },
                    ],
                }),
            },
        }),
        addOnsLabel: f.text({ label: 'Label before add-ons', default: 'Add ons' }),
        notes: f.strings({
            label: 'Notes at the bottom of the menu',
            itemName: 'note',
            default: [
                '5% VAT and applicable SD are included.',
                'A 5% service charge is applied on the final bill.',
                'All meat served is 100% halal.',
                'Please alert your server if you’re allergic to any ingredients.',
            ],
        }),
        badges: f.object({
            label: 'Dish mark names',
            fields: {
                spicy: f.text({ label: 'Spicy', default: 'Spicy' }),
                special: f.text({ label: "Chef's Special", default: "Chef's Special" }),
                featured: f.text({ label: 'Signature', default: 'Signature' }),
                new: f.text({ label: 'New', default: 'New' }),
            },
        }),
    },

    privacy: legalDoc('Privacy Policy', 'Khao San privacy policy and data protection information.', 'Last updated: August 6, 2026', [
        h('Introduction'),
        p('Khao San (“we” or “us” or “our”) operates the https://www.khaosandhaka.com website (the “Site”).'),
        h('Information We Collect'),
        p('We collect information you voluntarily provide when you contact us, such as through WhatsApp or Facebook. This may include your name, phone number, and the details of your inquiry.'),
        h('How We Use Your Information'),
        p('We use the information we collect to respond to your inquiries, arrange reservations and gift card purchases, and improve our service.'),
        h('Data Protection'),
        p('We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.'),
        h('Contact Us'),
        p('If you have any questions about this privacy policy, please reach us on WhatsApp at +88 01600-068193 or message us on [Facebook](https://www.facebook.com/KhaoSanDhaka).'),
    ]),

    terms: legalDoc('Terms of Service', 'Khao San terms of service and conditions of use.', 'Last updated: July 12, 2026', [
        h('Agreement to Terms'),
        p('By accessing and using the Khao San website, you accept and agree to be bound by the terms and provision of this agreement.'),
        h('Use License'),
        p('Permission is granted to temporarily download one copy of the materials (information or software) on the Khao San website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:'),
        { kind: 'bullets', items: [
            'Modify or copy the materials',
            'Use the materials for any commercial purpose or for any public display',
            'Attempt to decompile or reverse engineer any software contained on the Site',
            'Remove any copyright or other proprietary notations from the materials',
        ] },
        h('Disclaimer'),
        p('The materials on the Khao San website are provided “as is”. Khao San makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'),
        h('Limitations'),
        p('In no event shall Khao San or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Khao San website.'),
        h('Accuracy of Materials'),
        p('The materials appearing on the Khao San website could include technical, typographical, or photographic errors. Khao San does not warrant that any of the materials on the website are accurate, complete, or current.'),
        h('Links'),
        p("Khao San has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Khao San of the site. Use of any such linked website is at the user's own risk."),
        h('Modifications'),
        p('Khao San may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.'),
        h('Contact Us'),
        p('If you have any questions about these terms and conditions, please reach us on WhatsApp at +88 01600-068193 or message us on [Facebook](https://www.facebook.com/KhaoSanDhaka).'),
    ]),
} satisfies Record<string, Fields>;

export type DocKey = keyof typeof DOC_FIELDS;

export interface DocMeta {
    title: string;
    description: string;
    /** Page the live preview opens on. */
    previewPath: string;
}

export const DOC_META: Record<DocKey, DocMeta> = {
    home: { title: 'Homepage', description: 'Every section of the homepage: text, photos, videos, buttons and their order.', previewPath: '/' },
    menu: { title: 'Menu page', description: 'Headline, video, carousel and notes on the menu page. Dishes are under Menu dishes.', previewPath: '/menu' },
    navigation: { title: 'Header & footer', description: 'Menu links, buttons, opening hours, social media and the copyright line.', previewPath: '/' },
    locations: { title: 'Locations', description: 'Outlet names, addresses, phone numbers, hours and photos.', previewPath: '/#locations' },
    theme: { title: 'Colours, fonts & backgrounds', description: 'Brand colours, typefaces and the background artwork behind sections.', previewPath: '/' },
    site: { title: 'Site settings & SEO', description: 'Logo, WhatsApp number, Google title and description, social sharing image.', previewPath: '/' },
    privacy: { title: 'Privacy policy', description: 'The privacy policy page.', previewPath: '/legal/privacy' },
    terms: { title: 'Terms of service', description: 'The terms of service page.', previewPath: '/legal/terms' },
};

export const DOC_KEYS = Object.keys(DOC_FIELDS) as DocKey[];

export function isDocKey(key: string): key is DocKey {
    return Object.prototype.hasOwnProperty.call(DOC_FIELDS, key);
}

export type SiteContent = { [K in DocKey]: FieldsValue<(typeof DOC_FIELDS)[K]> };
export type HomeSection = SiteContent['home']['sections'][number];

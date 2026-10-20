import { bg, EMPTY_BACKGROUND, linkField, type Background, type CmsLink, type DocDef, type Field, type Option } from '../fields';

/** The header and footer - the parts of the site on every page. */

export interface NavLink { label: string; href: string }

export interface HeaderContent {
    brand: { logo: string; logoAlt: string };
    navigation: { links: NavLink[]; homeLabel: string };
    button: { visible: boolean; link: CmsLink };
    style: { barColor: string; textColor: string };
}

export const SOCIAL_PLATFORMS: Option[] = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'whatsapp', label: 'WhatsApp' },
];

export interface FooterContent {
    brand: {
        logo: string;
        logoAlt: string;
        logoWhite: boolean;
        tagline: string;
        showHours: boolean;
        button: CmsLink;
        showButton: boolean;
    };
    links: { items: NavLink[] };
    social: { items: { platform: string; url: string }[] };
    bottom: { copyright: string; legal: NavLink[] };
    style: { background: Background };
}

const NAV: NavLink[] = [
    { label: 'Menu', href: '/menu' },
    { label: 'Locations', href: '/#locations' },
    { label: 'Our Story', href: '/#heritage' },
    { label: 'Gift Cards', href: '/#gift' },
];

const LOGO = '/assets/Logos-20260709T183558Z-2-001/Logos/Khao San Logo.webp';

export const headerDefaults: HeaderContent = {
    brand: { logo: LOGO, logoAlt: 'Khao San - home' },
    navigation: { links: NAV, homeLabel: 'Home' },
    button: {
        visible: true,
        link: { label: 'Contact Us', type: 'whatsapp', url: '', message: "Hi, I'd like to get in touch with Khao San." },
    },
    style: { barColor: '', textColor: '' },
};

export const footerDefaults: FooterContent = {
    brand: {
        logo: LOGO,
        logoAlt: 'Khao San',
        logoWhite: true,
        tagline: 'Reinventing the Thai way.',
        showHours: true,
        button: { label: 'Reserve a Table', type: 'whatsapp', url: '', message: "Hi, I'd like to reserve a table at Khao San." },
        showButton: true,
    },
    links: { items: NAV },
    social: {
        items: [
            { platform: 'instagram', url: 'https://www.instagram.com/khaosandhaka/' },
            { platform: 'facebook', url: 'https://www.facebook.com/KhaoSanDhaka' },
        ],
    },
    bottom: {
        copyright: '© {year} Khao San Dhaka. All rights reserved.',
        legal: [
            { label: 'Privacy Policy', href: '/legal/privacy' },
            { label: 'Terms', href: '/legal/terms' },
        ],
    },
    style: { background: { ...EMPTY_BACKGROUND } },
};

const navFields: Field[] = [
    { kind: 'text', key: 'label', label: 'Text', maxLength: 40 },
    { kind: 'text', key: 'href', label: 'Links to', maxLength: 300, help: 'A page (/menu), a homepage section (/#locations, /#heritage, /#gift) or a full web address.' },
];

export const headerDoc: DocDef = {
    key: 'header',
    title: 'Header',
    description: 'The bar at the top of every page: logo, navigation links and the button on the right.',
    previewPath: '/menu',
    sections: [
        {
            key: 'brand',
            title: 'Logo',
            fields: [
                { kind: 'image', key: 'logo', label: 'Logo', help: 'A square PNG or WebP with a transparent background works best.' },
                { kind: 'text', key: 'logoAlt', label: 'Logo description', maxLength: 120 },
            ],
        },
        {
            key: 'navigation',
            title: 'Navigation links',
            fields: [
                {
                    kind: 'list', key: 'links', label: 'Links', itemLabel: 'link', titleKey: 'label', max: 8,
                    newItem: { label: 'New link', href: '/' },
                    fields: [...navFields],
                },
                { kind: 'text', key: 'homeLabel', label: 'Text for the link back home', maxLength: 40, help: 'On the page a link points to, that link turns into a link back to the homepage with this text.' },
            ],
        },
        {
            key: 'button',
            title: 'Button',
            fields: [
                { kind: 'toggle', key: 'visible', label: 'Show the button' },
                linkField('link', 'Button'),
            ],
        },
        {
            key: 'style',
            title: 'Colours',
            fields: [
                { kind: 'color', key: 'barColor', label: 'Bar colour', help: 'Leave empty for the frosted cream bar.' },
                { kind: 'color', key: 'textColor', label: 'Link colour' },
            ],
        },
    ],
};

export const footerDoc: DocDef = {
    key: 'footer',
    title: 'Footer',
    description: 'The bottom of every page: logo, opening hours, outlet addresses (from Locations & hours), links and social media.',
    previewPath: '/menu',
    sections: [
        {
            key: 'brand',
            title: 'Logo, tagline & button',
            fields: [
                { kind: 'image', key: 'logo', label: 'Logo' },
                { kind: 'text', key: 'logoAlt', label: 'Logo description', maxLength: 120 },
                { kind: 'toggle', key: 'logoWhite', label: 'Show the logo in white', help: 'Needed on a dark footer. Turn off if you make the footer light.' },
                { kind: 'text', key: 'tagline', label: 'Tagline', maxLength: 200 },
                { kind: 'toggle', key: 'showHours', label: 'Show opening hours', help: 'Taken from the first outlet in Locations & hours.' },
                { kind: 'toggle', key: 'showButton', label: 'Show the button' },
                linkField('button', 'Button'),
            ],
        },
        {
            key: 'links',
            title: 'Links',
            fields: [{
                kind: 'list', key: 'items', label: 'Links', itemLabel: 'link', titleKey: 'label', max: 12,
                newItem: { label: 'New link', href: '/' },
                fields: [...navFields],
            }],
        },
        {
            key: 'social',
            title: 'Social media',
            fields: [{
                kind: 'list', key: 'items', label: 'Accounts', itemLabel: 'account', titleKey: 'platform', max: 8,
                newItem: { platform: 'instagram', url: 'https://' },
                fields: [
                    { kind: 'select', key: 'platform', label: 'Platform', options: SOCIAL_PLATFORMS },
                    { kind: 'text', key: 'url', label: 'Profile address', maxLength: 300 },
                ],
            }],
        },
        {
            key: 'bottom',
            title: 'Bottom line',
            fields: [
                { kind: 'text', key: 'copyright', label: 'Copyright line', maxLength: 200, help: '{year} is replaced with the current year.' },
                {
                    kind: 'list', key: 'legal', label: 'Legal links', itemLabel: 'link', titleKey: 'label', max: 6,
                    newItem: { label: 'New link', href: '/' },
                    fields: [...navFields],
                },
            ],
        },
        {
            key: 'style',
            title: 'Background',
            fields: [bg()],
        },
    ],
};

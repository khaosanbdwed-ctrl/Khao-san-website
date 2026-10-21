import type { DocDef } from '../fields';

/** Site-wide settings: what Google and link previews show. */

export interface SiteSettingsContent {
    seo: {
        title: string;
        description: string;
        keywords: string;
        shareTitle: string;
        shareDescription: string;
        shareImage: string;
        favicon: string;
    };
}

export const siteDefaults: SiteSettingsContent = {
    seo: {
        title: 'Khao San | The Thai Way in Dhaka',
        description: 'Experience the uncompromising standard of authentic Thai Street Food at Khao San Dhaka. A curated dining experience in Gulshan, Dhanmondi, and Uttara.',
        keywords: 'Thai Food Dhaka, Khao San, Best Thai Restaurant, Fine Dining, Tom Yum Goong, Pad Thai, Gulshan Restaurant',
        shareTitle: 'Khao San | The Thai Way',
        shareDescription: 'An evening of unforgettable Thai hospitality. Experience the uncompromising standard of authentic Thai cuisine in Dhaka.',
        // The elephant landscape, cut to the 1200x630 (1.91:1) link-card shape
        // and saved as JPEG: WhatsApp - where every button on this site leads -
        // and LinkedIn do not reliably show a WebP preview, and a 16:9 image
        // is cropped differently by every app.
        shareImage: '/assets/share/khao-san-share.jpg',
        // Square: the brand mark on a white tile (generated from the logo,
        // like app/favicon.ico and app/apple-icon.png). It used to be the wide
        // wordmark, which shrinks to an unreadable strip in a 16px tab - and
        // /favicon.ico was still the Vercel triangle from the project template.
        favicon: '/assets/share/icon-512.png',
    },
};

export const siteDoc: DocDef = {
    key: 'site',
    title: 'Google & sharing',
    description: 'The title and description Google shows, the picture that appears when the site is shared on WhatsApp or Facebook, and the browser tab icon.',
    previewPath: '/',
    sections: [
        {
            key: 'seo',
            title: 'Search & sharing',
            fields: [
                { kind: 'text', key: 'title', label: 'Site title (browser tab and Google)', maxLength: 120 },
                { kind: 'text', key: 'description', label: 'Description for Google', multiline: true, maxLength: 300 },
                { kind: 'text', key: 'keywords', label: 'Keywords', maxLength: 400, help: 'Separated by commas.' },
                { kind: 'text', key: 'shareTitle', label: 'Title when shared', maxLength: 120 },
                { kind: 'text', key: 'shareDescription', label: 'Description when shared', multiline: true, maxLength: 300 },
                { kind: 'image', key: 'shareImage', label: 'Picture when shared', format: 'jpeg', help: 'Landscape, 1200 × 630 pixels, with the important part in the middle. Saved as JPEG so WhatsApp and Facebook show it.' },
                { kind: 'image', key: 'favicon', label: 'Browser tab icon', help: 'A square PNG, 512 × 512, with a simple mark - detail disappears at tab size.' },
            ],
        },
    ],
};

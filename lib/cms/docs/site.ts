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
        // The intended elephant landscape. The path that was hardcoded here
        // was missing its `Landing Page Section/` folder and 404'd, so shared
        // links showed no picture.
        shareImage: '/assets/Background-20260709T183540Z-2-001/Background/Landing Page Section/Elephant 16 by 9 Ratio Landscape.webp',
        favicon: '/assets/Logos-20260709T183558Z-2-001/Logos/Dark Blue.webp',
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
                { kind: 'image', key: 'shareImage', label: 'Picture when shared', help: 'Landscape, ideally 1200 × 630 pixels.' },
                { kind: 'image', key: 'favicon', label: 'Browser tab icon', help: 'A small square PNG or WebP.' },
            ],
        },
    ],
};

import type { DocDef, Field } from '../fields';

/** The Privacy Policy and Terms pages. */

export interface LegalPageContent {
    title: string;
    metaDescription: string;
    backLabel: string;
    blocks: { heading: string; body: string }[];
    updated: string;
}
export interface LegalContent { privacy: LegalPageContent; terms: LegalPageContent }

const CONTACT = 'If you have any questions about this privacy policy, please reach us on WhatsApp at +88 01600-068193 or message us on [Facebook](https://www.facebook.com/KhaoSanDhaka).';

export const legalDefaults: LegalContent = {
    privacy: {
        title: 'Privacy Policy',
        metaDescription: 'Khao San privacy policy and data protection information.',
        backLabel: '← Back to Home',
        blocks: [
            { heading: 'Introduction', body: 'Khao San (“we” or “us” or “our”) operates the https://www.khaosandhaka.com website (the “Site”).' },
            { heading: 'Information We Collect', body: 'We collect information you voluntarily provide when you contact us, such as through WhatsApp or Facebook. This may include your name, phone number, and the details of your inquiry.' },
            { heading: 'How We Use Your Information', body: 'We use the information we collect to respond to your inquiries, arrange reservations and gift card purchases, and improve our service.' },
            { heading: 'Data Protection', body: 'We implement appropriate security measures to protect your personal information against unauthorized access or disclosure.' },
            { heading: 'Contact Us', body: CONTACT },
        ],
        updated: 'Last updated: August 6, 2026',
    },
    terms: {
        title: 'Terms of Service',
        metaDescription: 'Khao San terms of service and conditions of use.',
        backLabel: '← Back to Home',
        blocks: [
            { heading: 'Agreement to Terms', body: 'By accessing and using the Khao San website, you accept and agree to be bound by the terms and provision of this agreement.' },
            {
                heading: 'Use License',
                body: 'Permission is granted to temporarily download one copy of the materials (information or software) on the Khao San website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n\n- Modify or copy the materials\n- Use the materials for any commercial purpose or for any public display\n- Attempt to decompile or reverse engineer any software contained on the Site\n- Remove any copyright or other proprietary notations from the materials',
            },
            { heading: 'Disclaimer', body: 'The materials on the Khao San website are provided “as is”. Khao San makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.' },
            { heading: 'Limitations', body: 'In no event shall Khao San or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the Khao San website.' },
            { heading: 'Accuracy of Materials', body: 'The materials appearing on the Khao San website could include technical, typographical, or photographic errors. Khao San does not warrant that any of the materials on the website are accurate, complete, or current.' },
            { heading: 'Links', body: 'Khao San has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Khao San of the site. Use of any such linked website is at the user\'s own risk.' },
            { heading: 'Modifications', body: 'Khao San may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.' },
            { heading: 'Contact Us', body: 'If you have any questions about these terms and conditions, please reach us on WhatsApp at +88 01600-068193 or message us on [Facebook](https://www.facebook.com/KhaoSanDhaka).' },
        ],
        updated: 'Last updated: July 12, 2026',
    },
};

const pageFields: Field[] = [
    { kind: 'text', key: 'title', label: 'Page title', maxLength: 120 },
    { kind: 'text', key: 'metaDescription', label: 'Description for Google', maxLength: 300 },
    { kind: 'text', key: 'backLabel', label: 'Back link text', maxLength: 60 },
    {
        kind: 'list', key: 'blocks', label: 'Sections', itemLabel: 'section', titleKey: 'heading', max: 40,
        newItem: { heading: 'New section', body: '' },
        fields: [
            { kind: 'text', key: 'heading', label: 'Heading', maxLength: 200 },
            {
                kind: 'text', key: 'body', label: 'Text', multiline: true, rich: true, maxLength: 8000,
                help: 'Leave an empty line between paragraphs. Start lines with "- " for a bulleted list. Write [Facebook](https://facebook.com/...) for a link.',
            },
        ],
    },
    { kind: 'text', key: 'updated', label: 'Last updated line', maxLength: 120 },
];

export const legalDoc: DocDef = {
    key: 'legal',
    title: 'Privacy & Terms',
    description: 'The Privacy Policy and Terms of Service pages.',
    previewPath: '/legal/privacy',
    sections: [
        { key: 'privacy', title: 'Privacy Policy', fields: pageFields },
        { key: 'terms', title: 'Terms of Service', fields: pageFields },
    ],
};

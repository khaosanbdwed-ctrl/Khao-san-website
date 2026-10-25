import { bg, EMPTY_BACKGROUND, type Background, type DocDef } from '../fields';

/**
 * The menu PAGE - everything around the dishes. The dishes themselves stay in
 * Menu Control (their own tables), which this document never touches.
 */
export interface MenuPageContent {
    /** Behind everything under the opening video - see menu-page-client. */
    page: { background: Background };
    hero: {
        background: Background;
        title: string;
        lede: string;
        showCount: boolean;
        countSuffix: string;
    };
    showcase: {
        visible: boolean;
        background: Background;
        heading: string;
        hint: string;
        picks: { categoryId: string; dishTitle: string }[];
    };
    dishes: { background: Background };
    notes: { visible: boolean; background: Background; terms: { text: string }[] };
}

export const menuPageDefaults: MenuPageContent = {
    page: { background: { ...EMPTY_BACKGROUND } },
    hero: {
        background: {
            ...EMPTY_BACKGROUND,
            video: '/assets/video-web/theatre-craft.mp4',
            poster: '/assets/posters/theatre-craft.webp',
            // Held back a little so the highlights do not punch through the
            // shade behind the title (was `.menu-hero-media { opacity: .85 }`).
            videoOpacity: 85,
        },
        title: 'A journey through fire.',
        lede: 'From fiery street-stall classics to whole-fish showpieces — every plate carries the char, spice and balance of Bangkok.',
        showCount: true,
        countSuffix: 'dishes',
    },
    showcase: {
        visible: true,
        background: { ...EMPTY_BACKGROUND },
        heading: 'A taste of Khao San',
        hint: 'Drag to discover',
        picks: [
            { categoryId: 'b-soups', dishTitle: 'Tom Yum Goong' },
            { categoryId: 'e-noodles', dishTitle: 'Pad Thai' },
            { categoryId: 'k-rice-bowls', dishTitle: 'Thai Seafood Bowl' },
            { categoryId: 'i-seafood', dishTitle: 'Fried Whole Fish in Spicy Hot Sauce' },
            { categoryId: 'l-desserts', dishTitle: 'Mango Sticky Rice' },
        ],
    },
    dishes: { background: { ...EMPTY_BACKGROUND } },
    notes: {
        visible: true,
        background: { ...EMPTY_BACKGROUND },
        terms: [
            { text: '5% VAT and applicable SD are included.' },
            { text: 'A 5% service charge is applied on the final bill.' },
            { text: 'All meat served is 100% halal.' },
            { text: 'Please alert your server if you’re allergic to any ingredients.' },
        ],
    },
};

export const menuPageDoc: DocDef = {
    key: 'menu',
    title: 'Menu page',
    description: 'The menu page around the dishes: the opening video and title, the dish showcase, backgrounds, and the notes at the bottom. Dishes and prices are edited in Menu Control.',
    previewPath: '/menu',
    sections: [
        {
            /* First, because it is what the client looks for: "the whole
               background of the menu page". The per-section backgrounds
               below still exist and sit on top of it. */
            key: 'page',
            title: 'Whole page background',
            description: 'The background of the whole menu page under the opening video - behind the dish showcase, every category and the notes. A photo stays in place while the page scrolls over it. A background set on a section below sits on top of this one.',
            fields: [{ ...bg(false, 'Page background'), help: 'Choose a colour or a photo. If it is much darker or lighter than the design, set Text colour to match so the dishes stay readable.' }],
        },
        {
            key: 'hero',
            title: 'Opening (hero)',
            fields: [
                { ...bg(true, 'Background video / photo'), help: 'Plays behind the title. Replace it with another video, or use a photo or colour.' },
                { kind: 'text', key: 'title', label: 'Title', maxLength: 120 },
                { kind: 'text', key: 'lede', label: 'Text under the title', multiline: true, maxLength: 400 },
                { kind: 'toggle', key: 'showCount', label: 'Show the number of dishes' },
                { kind: 'text', key: 'countSuffix', label: 'Word after the number', maxLength: 30 },
            ],
        },
        {
            key: 'showcase',
            title: 'Dish showcase',
            description: 'The sideways carousel of one signature dish per category.',
            hideable: true,
            fields: [
                bg(),
                { kind: 'text', key: 'heading', label: 'Heading', maxLength: 120 },
                { kind: 'text', key: 'hint', label: 'Hint under the carousel', maxLength: 60 },
                {
                    kind: 'list', key: 'picks', label: 'Dishes in the showcase', itemLabel: 'dish', titleKey: 'dishTitle', max: 13,
                    help: 'Pick a category and type the dish name exactly as it is in Menu Control. If the dish is not found, the category\'s featured dish is shown instead.',
                    newItem: { categoryId: '', dishTitle: '' },
                    fields: [
                        { kind: 'select', key: 'categoryId', label: 'Category', options: [], optionsFrom: 'menuCategories' },
                        { kind: 'text', key: 'dishTitle', label: 'Dish name', maxLength: 200 },
                    ],
                },
            ],
        },
        {
            key: 'dishes',
            title: 'Dish list',
            description: 'The full menu, category by category.',
            fields: [bg(false)],
        },
        {
            key: 'notes',
            title: 'Notes at the bottom',
            hideable: true,
            fields: [
                bg(false),
                {
                    kind: 'list', key: 'terms', label: 'Notes', itemLabel: 'note', titleKey: 'text', max: 12,
                    newItem: { text: '' },
                    fields: [{ kind: 'text', key: 'text', label: 'Note', maxLength: 300 }],
                },
            ],
        },
    ],
};

/**
 * Turns the Theme document into CSS custom-property overrides.
 *
 * Only values that DIFFER from the built-in defaults are emitted, so an
 * untouched theme produces no CSS at all and the stylesheet's own tokens
 * (app/styles/01-tokens.css) stay in charge. Every value has already passed
 * the allow-list validators in lib/cms/safe.ts during normalization, and is
 * re-checked here, because this string goes into a <style> element.
 */
import { normalizeDoc } from './content';
import { cssUrl, isHexColor, isSafeFontFamily, isSafeSrc } from './safe';
import type { SiteContent } from './schema';

type Theme = SiteContent['theme'];

let defaults: Theme | null = null;
const themeDefaults = () => (defaults ??= normalizeDoc('theme', undefined));

export function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mix toward black by `amount` (0-1) - for the pressed/hover shades. */
function deepen(hex: string, amount: number): string {
    const [r, g, b] = hexToRgb(hex).map(c => Math.round(c * (1 - amount)));
    return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

const rgba = (hex: string, a: number) => `rgba(${hexToRgb(hex).join(', ')}, ${a})`;

/** WCAG 2 relative luminance contrast ratio. */
export function contrastRatio(a: string, b: string): number {
    const lum = (hex: string) => {
        const [r, g, b2] = hexToRgb(hex).map(c => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
    };
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastCheck { label: string; fg: string; bg: string; ratio: number; min: number }

/**
 * The pairings that actually occur on the site. `min` is what the editor
 * enforces before publishing: below it, text is genuinely unreadable. The
 * white-on-orange button label sits at 2.16:1 by the client's own choice
 * (PRD §15.2), so the floor is set to keep that working while still
 * catching combinations that make text disappear.
 */
export function themeContrastChecks(theme: Theme): ContrastCheck[] {
    const c = theme.colors;
    const pair = (label: string, fg: string, bg: string, min: number): ContrastCheck =>
        ({ label, fg, bg, ratio: contrastRatio(fg, bg), min });
    return [
        pair('Body text on the page background', c.text, c.surface, 4.5),
        pair('Secondary text on the page background', c.textSecondary, c.surface, 3),
        pair('Headings (blue) on the page background', c.blue, c.surface, 3),
        pair('White text on blue sections', '#ffffff', c.blue, 3),
        pair('Butter accents on blue sections', c.butter, c.blue, 3),
        pair('White label on orange buttons', '#ffffff', c.orange, 2),
        pair('Dark label on light-blue buttons', '#16233d', c.powder, 3),
    ];
}

const FONT_ROLES = {
    display: { custom: 'KS Display', vars: ['--font-display', '--font-heading'], fallback: 'var(--font-montserrat), sans-serif' },
    script: { custom: 'KS Script', vars: ['--font-script'], fallback: 'var(--font-montserrat), cursive' },
    body: { custom: 'KS Body', vars: ['--font-sans'], fallback: 'sans-serif' },
} as const;

export interface ThemeOutput {
    css: string;
    /** Google Fonts stylesheets to load. */
    stylesheets: string[];
}

export function themeToCss(theme: Theme): ThemeOutput {
    const d = themeDefaults();
    const vars: string[] = [];
    const faces: string[] = [];
    const stylesheets: string[] = [];
    const set = (name: string, value: string) => vars.push(`${name}: ${value};`);
    const c = theme.colors;
    const changed = (k: keyof Theme['colors']) => isHexColor(c[k]) && c[k] !== d.colors[k];

    if (changed('orange')) set('--color-brand-orange', c.orange);
    if (changed('blue')) {
        set('--color-brand-blue', c.blue);
        set('--color-brand-blue-deep', deepen(c.blue, 0.3));
        set('--color-primary', c.blue);
        set('--color-secondary', c.blue);
        set('--color-accent', c.blue);
        set('--cms-blue-wash-a', rgba(c.blue, 0.86));
        set('--cms-blue-wash-b', rgba(c.blue, 0.92));
    }
    if (changed('butter')) {
        set('--color-brand-butter', c.butter);
        set('--color-brand-butter-deep', deepen(c.butter, 0.1));
    }
    if (changed('powder')) {
        set('--color-brand-powder', c.powder);
        set('--color-brand-powder-deep', deepen(c.powder, 0.15));
    }
    if (changed('text')) set('--color-text-primary', c.text);
    if (changed('textSecondary')) set('--color-text-secondary', c.textSecondary);
    if (changed('surface')) {
        set('--color-surface-base', c.surface);
        set('--color-surface-elevated', c.surface);
    }

    for (const role of Object.keys(FONT_ROLES) as (keyof typeof FONT_ROLES)[]) {
        const choice = theme.fonts[role];
        const meta = FONT_ROLES[role];
        let family: string | null = null;
        if (choice.source === 'google' && isSafeFontFamily(choice.family.trim())) {
            family = choice.family.trim();
            stylesheets.push(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&display=swap`);
        } else if (choice.source === 'upload' && choice.file && isSafeSrc(choice.file)) {
            family = meta.custom;
            faces.push(`@font-face { font-family: "${family}"; src: ${cssUrl(choice.file)}; font-display: swap; }`);
        }
        if (family) for (const v of meta.vars) set(v, `"${family}", ${meta.fallback}`);
    }

    const bg = (key: keyof Theme['backgrounds'], cssVar: string) => {
        const src = theme.backgrounds[key].src;
        if (src === d.backgrounds[key].src) return;
        if (src === '') set(cssVar, 'none');
        else if (isSafeSrc(src)) set(cssVar, cssUrl(src));
    };
    bg('blueField', '--cms-bg-blue-field');
    bg('giftField', '--cms-bg-gift-field');
    bg('footer', '--cms-bg-footer');

    const css = [...faces, vars.length ? `:root { ${vars.join(' ')} }` : ''].filter(Boolean).join('\n');
    return { css, stylesheets };
}

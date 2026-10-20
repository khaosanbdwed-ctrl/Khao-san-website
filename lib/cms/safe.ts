/**
 * Validators for values that leave the CMS and land in markup or CSS.
 *
 * Everything an editor types is treated as untrusted: hrefs end up in <a>,
 * image sources in next/image and CSS `url()`, colours and font names inside a
 * <style> block. These checks are the only thing standing between a pasted
 * value and script injection, so they are allow-lists, not deny-lists.
 */

/** Characters that could break out of a quoted CSS url() or an HTML attribute. */
const UNSAFE_CHARS = /["'`<>\\\u0000-\u001f\u007f]/;

/** A link target: site-relative path, in-page anchor, http(s), mailto or tel. */
export function isSafeHref(value: string): boolean {
    if (value === '') return true;
    if (UNSAFE_CHARS.test(value) || value.length > 2000) return false;
    if (value.startsWith('#')) return true;
    if (value.startsWith('/')) return !value.startsWith('//');
    return /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d\s-]+)$/i.test(value);
}

/** An asset source: a file under /public or an http(s) URL. */
export function isSafeSrc(value: string): boolean {
    if (value === '') return true;
    if (UNSAFE_CHARS.test(value) || value.length > 2000) return false;
    if (value.startsWith('/')) return !value.startsWith('//');
    return /^https?:\/\/[^\s]+$/i.test(value);
}

export function isHexColor(value: string): boolean {
    return /^#[0-9a-f]{6}$/i.test(value);
}

/** Font family names go inside a CSS string, so keep them to plain words. */
export function isSafeFontFamily(value: string): boolean {
    return /^[A-Za-z0-9][A-Za-z0-9 \-]{0,60}$/.test(value);
}

/** An HTML id / URL fragment. */
export function isSafeAnchor(value: string): boolean {
    return value === '' || /^[a-z][a-z0-9-]{0,40}$/.test(value);
}

/** Digits only, as wa.me expects. */
export function isWhatsAppNumber(value: string): boolean {
    return /^\d{6,15}$/.test(value);
}

export function cssUrl(src: string): string {
    // isSafeSrc has already rejected quotes and backslashes, so wrapping in
    // double quotes cannot be broken out of.
    return `url("${src}")`;
}

// Lists the images, videos and fonts bundled in /public/assets so the admin's
// media picker can offer them. Runs automatically before `dev` and `build`
// (see package.json), because files under /public are not readable from a
// serverless function at runtime.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('public');
const out = path.resolve('lib/cms/bundled-assets.json');
const KIND = { jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', gif: 'image', avif: 'image', svg: 'image', mp4: 'video', webm: 'video' };

const files = [];
(function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else {
            const ext = entry.name.split('.').pop().toLowerCase();
            if (KIND[ext]) files.push({ src: '/' + path.relative(root, full).split(path.sep).join('/'), kind: KIND[ext] });
        }
    }
})(path.join(root, 'assets'));

files.sort((a, b) => a.src.localeCompare(b.src));
fs.writeFileSync(out, JSON.stringify(files, null, 1) + '\n');
console.log(`[assets] ${files.length} bundled files listed in lib/cms/bundled-assets.json`);

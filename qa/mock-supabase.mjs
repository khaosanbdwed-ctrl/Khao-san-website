// A local stand-in for Supabase - just the parts of PostgREST (menu tables)
// and Storage (buckets, signed uploads, public files) this site uses - so the
// whole site and dashboard can be tested with no Supabase project, no network
// and no real keys. Seeds the menu from ../scripts/setup-db.mjs. Persists to
// ./mock-data; GET /__reset reseeds and empties storage.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 54321);
const DATA = path.resolve(process.env.MOCK_DATA || new URL('./mock-data', import.meta.url).pathname);
const SEED = process.env.SEED_FILE || new URL('../scripts/setup-db.mjs', import.meta.url).pathname;
fs.mkdirSync(DATA, { recursive: true });
const DB_FILE = path.join(DATA, 'db.json');
const BUCKETS_FILE = path.join(DATA, 'buckets.json');
const OBJ_DIR = path.join(DATA, 'objects');
fs.mkdirSync(OBJ_DIR, { recursive: true });

function seedDb() {
    const src = fs.readFileSync(SEED, 'utf8');
    const start = src.indexOf('const MENU_DATA = [');
    const end = src.indexOf('\n]\n', start);
    const ctx = {};
    vm.runInNewContext(src.slice(start, end + 3).replace('const MENU_DATA', 'MENU_DATA'), ctx);
    const MENU = ctx.MENU_DATA;
    const db = { menu_categories: [], menu_category_addons: [], menu_items: [] };
    let sort = 0;
    MENU.forEach((cat, i) => {
        db.menu_categories.push({ id: cat.id, name: cat.name, sort_order: i, created_at: new Date().toISOString() });
        (cat.addOns || []).forEach(a => db.menu_category_addons.push({ id: crypto.randomUUID(), category_id: cat.id, title: a.title, price: a.price }));
        cat.items.forEach(item => db.menu_items.push({
            id: crypto.randomUUID(), category_id: cat.id, item_number: item.number, title: item.title,
            image_src: item.imageSrc || null, price: item.price, group_price: item.groupPrice || null,
            portion_note: item.portionNote || null, description: item.description || null,
            badges: item.badges || [], add_on_note: item.addOnNote || null, angled: item.angled || false,
            sort_order: sort++, created_at: new Date().toISOString(),
        }));
    });
    return db;
}

let db = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) : seedDb();
let buckets = fs.existsSync(BUCKETS_FILE) ? JSON.parse(fs.readFileSync(BUCKETS_FILE, 'utf8')) : {};
const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 1));
const saveBuckets = () => fs.writeFileSync(BUCKETS_FILE, JSON.stringify(buckets, null, 1));
saveDb();

const tokens = new Map(); // signed upload token -> {bucket, path}
const log = [];

function send(res, status, body, headers = {}) {
    const isBuf = Buffer.isBuffer(body);
    res.writeHead(status, { 'content-type': isBuf ? (headers['content-type'] || 'application/octet-stream') : 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*', 'access-control-expose-headers': '*', ...headers });
    res.end(isBuf ? body : body === undefined ? '' : JSON.stringify(body));
}
const notFound = (res, message = 'Object not found') => send(res, 404, { statusCode: '404', error: 'not_found', message });

async function readBody(req) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    return Buffer.concat(chunks);
}

/* ---------- multipart (signed upload sends FormData) ---------- */
function parseMultipart(buf, contentType) {
    const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
    if (!m) return null;
    const boundary = Buffer.from('--' + (m[1] || m[2]));
    const parts = [];
    let idx = buf.indexOf(boundary);
    while (idx !== -1) {
        const next = buf.indexOf(boundary, idx + boundary.length);
        if (next === -1) break;
        const part = buf.slice(idx + boundary.length + 2, next - 2);
        const headEnd = part.indexOf('\r\n\r\n');
        const head = part.slice(0, headEnd).toString();
        const body = part.slice(headEnd + 4);
        const name = /name="([^"]*)"/.exec(head)?.[1];
        const ctype = /content-type:\s*([^\r\n]+)/i.exec(head)?.[1];
        const filename = /filename="([^"]*)"/.exec(head)?.[1];
        parts.push({ name, ctype, filename, body });
        idx = next;
    }
    return parts;
}

/* ---------- storage ---------- */
const objFile = (bucket, p) => path.join(OBJ_DIR, bucket, p);
const metaFile = (bucket, p) => objFile(bucket, p) + '.__meta.json';

function putObject(res, bucket, p, body, contentType, upsert) {
    const b = buckets[bucket];
    if (!b) return send(res, 404, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
    if (b.allowed_mime_types?.length && !b.allowed_mime_types.includes(contentType)) {
        return send(res, 415, { statusCode: '415', error: 'invalid_mime_type', message: `mime type ${contentType} is not supported` });
    }
    if (b.file_size_limit && body.length > b.file_size_limit) {
        return send(res, 413, { statusCode: '413', error: 'Payload too large', message: 'The object exceeded the maximum allowed size' });
    }
    const f = objFile(bucket, p);
    if (!upsert && fs.existsSync(f)) return send(res, 409, { statusCode: '409', error: 'Duplicate', message: 'The resource already exists' });
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
    const created = fs.existsSync(metaFile(bucket, p)) ? JSON.parse(fs.readFileSync(metaFile(bucket, p))).created_at : new Date().toISOString();
    fs.writeFileSync(metaFile(bucket, p), JSON.stringify({ contentType, size: body.length, created_at: created, updated_at: new Date().toISOString() }));
    log.push({ op: 'put', bucket, p, size: body.length, contentType });
    send(res, 200, { Key: `${bucket}/${p}`, Id: crypto.randomUUID() });
}

function extractUpload(buf, req) {
    const ct = req.headers['content-type'] || '';
    if (ct.startsWith('multipart/form-data')) {
        const parts = parseMultipart(buf, ct) || [];
        const file = parts.find(x => x.filename !== undefined || x.name === '');
        return { body: file?.body ?? Buffer.alloc(0), contentType: file?.ctype || 'application/octet-stream' };
    }
    return { body: buf, contentType: ct.split(';')[0] || 'application/octet-stream' };
}

function listObjects(bucket, prefix, opts) {
    const dir = path.join(OBJ_DIR, bucket, prefix || '');
    if (!fs.existsSync(dir)) return [];
    const out = [];
    for (const name of fs.readdirSync(dir)) {
        if (name.endsWith('.__meta.json')) continue;
        const full = path.join(dir, name);
        if (fs.statSync(full).isDirectory()) { out.push({ name, id: null, metadata: null, created_at: null, updated_at: null }); continue; }
        const meta = JSON.parse(fs.readFileSync(full + '.__meta.json'));
        out.push({ name, id: crypto.createHash('md5').update(full).digest('hex'), created_at: meta.created_at, updated_at: meta.updated_at, metadata: { size: meta.size, mimetype: meta.contentType } });
    }
    const sort = opts?.sortBy || { column: 'name', order: 'asc' };
    out.sort((a, b) => {
        const av = a[sort.column] ?? '', bv = b[sort.column] ?? '';
        const c = String(av).localeCompare(String(bv));
        return sort.order === 'desc' ? -c : c;
    });
    return out.slice(opts?.offset || 0, (opts?.offset || 0) + (opts?.limit || 100));
}

async function storage(req, res, url) {
    const p = url.pathname.replace(/^\/storage\/v1/, '');
    const buf = await readBody(req);
    let m;

    if (p === '/bucket' && req.method === 'GET') return send(res, 200, Object.values(buckets));
    if (p === '/bucket' && req.method === 'POST') {
        const b = JSON.parse(buf.toString());
        if (buckets[b.id]) return send(res, 409, { statusCode: '409', error: 'Duplicate', message: 'The resource already exists' });
        buckets[b.id] = { id: b.id, name: b.name, public: !!b.public, file_size_limit: b.file_size_limit ?? null, allowed_mime_types: b.allowed_mime_types ?? null, created_at: new Date().toISOString() };
        saveBuckets();
        log.push({ op: 'createBucket', id: b.id });
        return send(res, 200, { name: b.id });
    }
    if ((m = p.match(/^\/bucket\/([^/]+)$/))) {
        const id = decodeURIComponent(m[1]);
        if (req.method === 'GET') return buckets[id] ? send(res, 200, buckets[id]) : send(res, 404, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
        if (req.method === 'PUT') {
            if (!buckets[id]) return send(res, 404, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
            const b = JSON.parse(buf.toString());
            Object.assign(buckets[id], { public: !!b.public, file_size_limit: b.file_size_limit ?? null, allowed_mime_types: b.allowed_mime_types ?? null });
            saveBuckets();
            log.push({ op: 'updateBucket', id });
            return send(res, 200, { message: 'Successfully updated' });
        }
    }
    if ((m = p.match(/^\/object\/list\/([^/]+)$/)) && req.method === 'POST') {
        const opts = JSON.parse(buf.toString() || '{}');
        return send(res, 200, listObjects(decodeURIComponent(m[1]), opts.prefix, opts));
    }
    if ((m = p.match(/^\/object\/upload\/sign\/([^/]+)\/(.+)$/))) {
        const bucket = decodeURIComponent(m[1]); const key = decodeURIComponent(m[2]);
        if (req.method === 'POST') {
            if (!buckets[bucket]) return send(res, 404, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
            const token = crypto.randomBytes(16).toString('hex');
            tokens.set(token, { bucket, key });
            return send(res, 200, { url: `/object/upload/sign/${m[1]}/${m[2]}?token=${token}` });
        }
        if (req.method === 'PUT') {
            const t = tokens.get(url.searchParams.get('token'));
            if (!t || t.bucket !== bucket || t.key !== key) return send(res, 400, { statusCode: '403', error: 'invalid_signature', message: 'invalid signature' });
            const { body, contentType } = extractUpload(buf, req);
            return putObject(res, bucket, key, body, contentType, req.headers['x-upsert'] === 'true');
        }
    }
    if ((m = p.match(/^\/object\/public\/([^/]+)\/(.+)$/)) && (req.method === 'GET' || req.method === 'HEAD')) {
        const bucket = decodeURIComponent(m[1]); const key = decodeURIComponent(m[2]);
        if (!buckets[bucket]?.public) return send(res, 400, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
        const f = objFile(bucket, key);
        if (!fs.existsSync(f)) return notFound(res);
        const meta = JSON.parse(fs.readFileSync(metaFile(bucket, key)));
        return send(res, 200, fs.readFileSync(f), { 'content-type': meta.contentType, 'cache-control': 'max-age=3600' });
    }
    if ((m = p.match(/^\/object\/(?:authenticated\/)?([^/]+)\/(.+)$/)) && req.method === 'GET') {
        const bucket = decodeURIComponent(m[1]); const key = decodeURIComponent(m[2]);
        if (!buckets[bucket]) return send(res, 400, { statusCode: '404', error: 'Bucket not found', message: 'Bucket not found' });
        const f = objFile(bucket, key);
        if (!fs.existsSync(f)) return notFound(res);
        const meta = JSON.parse(fs.readFileSync(metaFile(bucket, key)));
        return send(res, 200, fs.readFileSync(f), { 'content-type': meta.contentType });
    }
    if ((m = p.match(/^\/object\/([^/]+)\/(.+)$/)) && (req.method === 'POST' || req.method === 'PUT')) {
        const bucket = decodeURIComponent(m[1]); const key = decodeURIComponent(m[2]);
        const { body, contentType } = extractUpload(buf, req);
        return putObject(res, bucket, key, body, contentType, req.method === 'PUT' || req.headers['x-upsert'] === 'true');
    }
    if ((m = p.match(/^\/object\/([^/]+)$/)) && req.method === 'DELETE') {
        const bucket = decodeURIComponent(m[1]);
        const { prefixes } = JSON.parse(buf.toString());
        const removed = [];
        for (const key of prefixes) {
            const f = objFile(bucket, key);
            if (fs.existsSync(f)) { fs.unlinkSync(f); fs.rmSync(metaFile(bucket, key), { force: true }); removed.push({ name: key }); }
        }
        log.push({ op: 'remove', bucket, prefixes });
        return send(res, 200, removed);
    }
    send(res, 404, { statusCode: '404', error: 'route', message: `mock: no route ${req.method} ${p}` });
}

/* ---------- PostgREST ---------- */
function applyFilters(rows, params) {
    for (const [k, v] of params) {
        if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(k)) continue;
        const [op, ...rest] = v.split('.');
        const val = rest.join('.');
        if (op === 'eq') rows = rows.filter(r => String(r[k]) === val);
        else if (op === 'in') { const set = val.replace(/^\(|\)$/g, '').split(','); rows = rows.filter(r => set.includes(String(r[k]))); }
    }
    return rows;
}
function project(rows, select) {
    if (!select || select === '*') return rows;
    const cols = select.split(',').map(s => s.trim());
    return rows.map(r => Object.fromEntries(cols.map(c => [c, r[c]])));
}

async function rest(req, res, url) {
    const table = url.pathname.replace(/^\/rest\/v1\//, '');
    if (!db[table]) return send(res, 404, { code: '42P01', message: `relation "${table}" does not exist` });
    const params = url.searchParams;
    const accept = req.headers['accept'] || '';
    const wantsObject = accept.includes('vnd.pgrst.object');
    const prefer = req.headers['prefer'] || '';
    const buf = await readBody(req);

    const finish = (rows, status = 200) => {
        if (wantsObject) {
            if (rows.length !== 1) return send(res, 406, { code: 'PGRST116', details: `Results contain ${rows.length} rows`, hint: null, message: 'JSON object requested, multiple (or no) rows returned' });
            return send(res, status, rows[0]);
        }
        const headers = {};
        if (/count=exact/.test(prefer)) headers['content-range'] = `0-${Math.max(0, rows.length - 1)}/${rows.length}`;
        if (req.method === 'HEAD') { res.writeHead(status, { ...headers, 'content-type': 'application/json' }); return res.end(); }
        send(res, status, rows, headers);
    };

    if (req.method === 'GET' || req.method === 'HEAD') {
        let rows = applyFilters([...db[table]], params);
        const order = params.get('order');
        if (order) {
            const [col, dir] = order.split('.');
            rows.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (dir === 'desc' ? -1 : 1));
        }
        const total = rows.length;
        if (params.get('limit')) rows = rows.slice(0, Number(params.get('limit')));
        if (/count=exact/.test(prefer) && req.method === 'HEAD') {
            res.writeHead(200, { 'content-range': `0-${total - 1}/${total}` }); return res.end();
        }
        return finish(project(rows, params.get('select')));
    }
    if (req.method === 'POST') {
        const input = JSON.parse(buf.toString());
        const arr = Array.isArray(input) ? input : [input];
        const out = [];
        for (const row of arr) {
            if (table === 'menu_items' && !db.menu_categories.some(c => c.id === row.category_id)) {
                return send(res, 409, { code: '23503', message: 'insert or update on table "menu_items" violates foreign key constraint', details: '', hint: null });
            }
            const full = { id: crypto.randomUUID(), created_at: new Date().toISOString(), badges: [], ...row };
            db[table].push(full); out.push(full);
        }
        saveDb();
        return finish(project(out, params.get('select')), 201);
    }
    if (req.method === 'PATCH') {
        const patch = JSON.parse(buf.toString());
        if (table === 'menu_items' && patch.category_id !== undefined && !db.menu_categories.some(c => c.id === patch.category_id)) {
            return send(res, 409, { code: '23503', message: 'fk violation', details: '', hint: null });
        }
        const rows = applyFilters(db[table], params);
        rows.forEach(r => Object.assign(r, patch));
        saveDb();
        return finish(project(rows, params.get('select')));
    }
    if (req.method === 'DELETE') {
        const rows = applyFilters(db[table], params);
        db[table] = db[table].filter(r => !rows.includes(r));
        saveDb();
        return finish(project(rows, params.get('select')));
    }
    send(res, 405, { message: 'method' });
}

http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        if (req.method === 'OPTIONS') return send(res, 204);
        if (url.pathname === '/__log') return send(res, 200, log);
        if (url.pathname === '/__reset') { db = seedDb(); saveDb(); buckets = {}; saveBuckets(); fs.rmSync(OBJ_DIR, { recursive: true, force: true }); fs.mkdirSync(OBJ_DIR); return send(res, 200, { ok: true }); }
        if (url.pathname.startsWith('/storage/v1')) return await storage(req, res, url);
        if (url.pathname.startsWith('/rest/v1/')) return await rest(req, res, url);
        send(res, 404, { message: 'mock: unknown path ' + url.pathname });
    } catch (e) {
        console.error(e);
        send(res, 500, { message: String(e) });
    }
}).listen(PORT, () => console.log(`mock supabase on :${PORT}`));

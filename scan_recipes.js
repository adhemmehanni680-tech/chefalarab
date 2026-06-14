const fs = require('fs');
const path = 'src/data/recipes.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));
const terms = [
  { key: 'خنزير', label: 'لحم خنزير' },
  { key: 'خمر', label: 'خمر' },
  { key: 'خمور', label: 'خمور' },
  { key: 'كحول', label: 'كحول' },
  { key: 'نبيذ', label: 'نبيذ' },
  { key: 'بيرة', label: 'بيرة' },
  { key: 'فودكا', label: 'فودكا' },
  { key: 'روم', label: 'روم' },
  { key: 'ويسكي', label: 'ويسكي' },
  { key: 'براندي', label: 'براندي' },
  { key: 'شامبانيا', label: 'شامبانيا' }
];
const regexes = terms.map(t => ({ label: t.label, re: new RegExp(`(?:^|[^\u0600-\u06FF])${t.key}(?:[^\u0600-\u06FF]|$)`, 'iu') }));
const normalizeField = obj => {
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(normalizeField).join(' ');
  if (obj && typeof obj === 'object') return Object.values(obj).map(normalizeField).join(' ');
  return '';
};
const matches = [];
for (let i = 0; i < data.length; i++) {
  const item = data[i];
  const text = [item.title, item.slug, item.intro, item.description, normalizeField(item.ingredients), normalizeField(item.steps), normalizeField(item.tags), normalizeField(item.category), item.img?.alt].join(' ').toLowerCase();
  const found = regexes.filter(r => r.re.test(text)).map(r => r.label);
  if (found.length) matches.push({ index: i, id: item.id, title: item.title, reasons: [...new Set(found)] });
}
const titleMap = new Map();
const slugMap = new Map();
for (let i = 0; i < data.length; i++) {
  const t = data[i].title.trim();
  const s = data[i].slug.trim();
  if (!titleMap.has(t)) titleMap.set(t, []);
  titleMap.get(t).push({ index: i, id: data[i].id });
  if (!slugMap.has(s)) slugMap.set(s, []);
  slugMap.get(s).push({ index: i, id: data[i].id });
}
const dupTitles = Array.from(titleMap.entries()).filter(([title, items]) => items.length > 1);
const dupSlugs = Array.from(slugMap.entries()).filter(([slug, items]) => items.length > 1);
console.log('FOUND_MATCHES', matches.length);
for (const m of matches) console.log(`${m.id}|${m.title}|${m.reasons.join(',')}`);
console.log('FOUND_DUP_TITLES', dupTitles.length);
for (const [title, items] of dupTitles) { console.log('DUP_TITLE', title); items.forEach(item => console.log('  ' + item.id)); }
console.log('FOUND_DUP_SLUGS', dupSlugs.length);
for (const [slug, items] of dupSlugs) { console.log('DUP_SLUG', slug); items.forEach(item => console.log('  ' + item.id)); }

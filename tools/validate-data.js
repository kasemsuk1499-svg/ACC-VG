// ใช้ตรวจ JSON ง่าย ๆ ด้วย Node.js
// node tools/validate-data.js

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cardsPath = path.join(root, 'data/cards/anime-core.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
const ids = new Set();
const errors = [];

for (const card of cards) {
  if (!card.id) errors.push('พบการ์ดไม่มี id');
  if (ids.has(card.id)) errors.push(`id ซ้ำ: ${card.id}`);
  ids.add(card.id);
  if (typeof card.grade !== 'number') errors.push(`${card.id} grade ไม่ใช่ number`);
  if (!Array.isArray(card.skills)) errors.push(`${card.id} skills ต้องเป็น array`);
  if (!Array.isArray(card.styleTags)) errors.push(`${card.id} styleTags ต้องเป็น array`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${cards.length} cards`);

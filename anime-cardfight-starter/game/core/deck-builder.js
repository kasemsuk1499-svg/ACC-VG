import { DECK_RULES, TRIGGERS } from './constants.js';

export function countBy(list, fn) {
  return list.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function validateDeck({ mainDeckIds, pathDeckIds, cardMap, rules = DECK_RULES }) {
  const errors = [];
  const allIds = [...mainDeckIds, ...pathDeckIds];

  if (mainDeckIds.length !== rules.mainDeckSize) {
    errors.push(`Battle Deck ต้องมี ${rules.mainDeckSize} ใบ ตอนนี้มี ${mainDeckIds.length} ใบ`);
  }

  const pathGrades = pathDeckIds.map(id => cardMap[id]?.grade).sort((a, b) => a - b);
  const requiredGrades = [...rules.pathDeckGrades].sort((a, b) => a - b);
  if (JSON.stringify(pathGrades) !== JSON.stringify(requiredGrades)) {
    errors.push(`Anime Path Deck ต้องมี Grade ${requiredGrades.join(', ')} อย่างละ 1 ใบ`);
  }

  const copies = countBy(allIds, id => id);
  for (const [id, count] of Object.entries(copies)) {
    if (count > rules.maxCopies) errors.push(`${cardMap[id]?.name || id} เกิน ${rules.maxCopies} ใบ`);
  }

  const triggerCards = allIds.map(id => cardMap[id]).filter(card => TRIGGERS.includes(card?.trigger));
  if (triggerCards.length !== rules.triggerTotal) {
    errors.push(`Trigger รวมต้องมี ${rules.triggerTotal} ใบ ตอนนี้มี ${triggerCards.length} ใบ`);
  }

  const overCount = triggerCards.filter(card => card.trigger === 'OVER').length;
  if (overCount > rules.overTriggerMax) errors.push(`OVER Trigger ใส่ได้สูงสุด ${rules.overTriggerMax} ใบ`);

  const healCount = triggerCards.filter(card => card.trigger === 'HEAL').length;
  if (healCount > rules.healTriggerMax) errors.push(`HEAL Trigger ใส่ได้สูงสุด ${rules.healTriggerMax} ใบ`);

  return { ok: errors.length === 0, errors };
}

export function makeSampleDeck(cardMap) {
  const pathDeckIds = [
    'ACC-G0-STARTER-001',
    'ACC-G1-MAGIC-001',
    'ACC-G2-SHONEN-001',
    'ACC-G3-MAGIC-ACE-001'
  ];

  const mainDeckIds = [];
  const add = (id, count) => { for (let i = 0; i < count; i += 1) mainDeckIds.push(id); };

  add('ACC-G3-MAGIC-ACE-001', 3);
  add('ACC-G2-SHONEN-001', 12);
  add('ACC-G1-MAGIC-001', 15);
  add('ACC-G1-TRIG-CRIT-001', 8);
  add('ACC-G1-TRIG-DRAW-001', 4);
  add('ACC-G0-TRIG-HEAL-001', 4);
  add('ACC-G3-TRIG-OVER-001', 1);
  add('ACC-G0-STARTER-001', 3);

  return { mainDeckIds, pathDeckIds };
}

export function rollBanner({ profile, banner, cards, count = 1, rng = Math.random }) {
  if (!profile.currency) profile.currency = { gem: 0, coin: 0 };
  if (!profile.ownedCards) profile.ownedCards = {};
  if (!profile.pity) profile.pity = {};

  const cost = count >= 10 ? banner.tenCost * Math.floor(count / 10) + banner.singleCost * (count % 10) : banner.singleCost * count;
  if ((profile.currency[banner.currency] || 0) < cost) {
    return { ok: false, error: `${banner.currency} ไม่พอ`, rewards: [] };
  }
  profile.currency[banner.currency] -= cost;

  const cardMap = Object.fromEntries(cards.map(card => [card.id, card]));
  const pool = banner.pool.map(id => cardMap[id]).filter(Boolean);
  const byRarity = groupBy(pool, card => card.rarity);
  const rewards = [];

  for (let i = 0; i < count; i += 1) {
    const pityHit = checkPity(profile, banner);
    const rarity = pityHit || pickRarity(banner.rates, rng);
    const available = byRarity[rarity]?.length ? byRarity[rarity] : pool;
    const card = available[Math.floor(rng() * available.length)];
    rewards.push(card);
    profile.ownedCards[card.id] = (profile.ownedCards[card.id] || 0) + 1;
    updatePity(profile, banner, card.rarity);
  }

  return { ok: true, cost, rewards, profile };
}

function groupBy(list, fn) {
  return list.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function pickRarity(rates, rng) {
  const entries = Object.entries(rates);
  const total = entries.reduce((sum, [, rate]) => sum + rate, 0);
  let roll = rng() * total;
  for (const [rarity, rate] of entries) {
    roll -= rate;
    if (roll <= 0) return rarity;
  }
  return entries[0][0];
}

function checkPity(profile, banner) {
  const bannerPity = profile.pity[banner.id] || {};
  const pityEntries = Object.entries(banner.pity || {}).sort((a, b) => b[1].after - a[1].after);
  for (const [rarity, rule] of pityEntries) {
    if ((bannerPity[rarity] || 0) + 1 >= rule.after) return rarity;
  }
  return null;
}

function updatePity(profile, banner, hitRarity) {
  if (!profile.pity[banner.id]) profile.pity[banner.id] = {};
  const state = profile.pity[banner.id];
  for (const [rarity, rule] of Object.entries(banner.pity || {})) {
    state[rarity] = (state[rarity] || 0) + 1;
    if (hitRarity === rarity && rule.resetOnHit) state[rarity] = 0;
  }
}

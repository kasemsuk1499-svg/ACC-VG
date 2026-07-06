export function calculateSalary({ profile, cards, salaryConfig, activeDeckIds = [], supportIds = [] }) {
  const ownedCards = profile.ownedCards || {};
  let coinPerHour = salaryConfig.base?.coinPerHour || 0;
  let gemPerDay = salaryConfig.base?.gemPerDay || 0;

  const cardMap = Object.fromEntries(cards.map(card => [card.id, card]));
  for (const [cardId, amount] of Object.entries(ownedCards)) {
    const card = cardMap[cardId];
    if (!card) continue;
    const rarityMult = salaryConfig.rarityMultiplier?.[card.rarity] || 1;
    const inDeck = activeDeckIds.includes(cardId);
    const inSupport = supportIds.includes(cardId);
    const deckMult = inDeck ? salaryConfig.deckBonus.activeDeckMultiplier : 1;
    const supportMult = inSupport ? salaryConfig.deckBonus.supportSlotMultiplier : 1;

    coinPerHour += (card.salary?.coinPerHour || 0) * amount * rarityMult * deckMult * supportMult;
    gemPerDay += (card.salary?.gemPerDay || 0) * amount * rarityMult * deckMult * supportMult;
  }

  return {
    coinPerHour: Math.floor(coinPerHour),
    gemPerDay: Math.floor(gemPerDay)
  };
}

export function claimOfflineSalary({ profile, cards, salaryConfig, now = Date.now(), activeDeckIds = [], supportIds = [] }) {
  if (!profile.currency) profile.currency = { coin: 0, gem: 0 };
  const last = profile.lastSalaryClaimAt || now;
  const elapsedHours = Math.min((now - last) / 3600000, salaryConfig.maxOfflineHours || 24);
  const rate = calculateSalary({ profile, cards, salaryConfig, activeDeckIds, supportIds });
  const coin = Math.floor(rate.coinPerHour * elapsedHours);
  const gem = Math.floor((rate.gemPerDay / 24) * elapsedHours);

  profile.currency.coin = (profile.currency.coin || 0) + coin;
  profile.currency.gem = (profile.currency.gem || 0) + gem;
  profile.lastSalaryClaimAt = now;

  return { coin, gem, elapsedHours, rate, profile };
}

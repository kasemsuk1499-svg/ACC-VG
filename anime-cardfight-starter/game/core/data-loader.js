import { DATA_SOURCE } from '../../config/data-source.js';

async function loadJsonWithFallback(remoteUrl, localUrl) {
  const candidates = [];
  if (remoteUrl) candidates.push(remoteUrl);
  if (DATA_SOURCE.useLocalFallback && localUrl) candidates.push(localUrl);

  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      console.warn(`โหลดข้อมูลไม่สำเร็จจาก ${url}`, error);
    }
  }
  throw lastError || new Error('ไม่พบแหล่งข้อมูล JSON');
}

export async function loadGameData() {
  const [cards, banners, salary] = await Promise.all([
    loadJsonWithFallback(DATA_SOURCE.cardsUrl, DATA_SOURCE.local.cardsUrl),
    loadJsonWithFallback(DATA_SOURCE.bannersUrl, DATA_SOURCE.local.bannersUrl),
    loadJsonWithFallback(DATA_SOURCE.salaryUrl, DATA_SOURCE.local.salaryUrl)
  ]);

  const cardMap = Object.fromEntries(cards.map(card => [card.id, card]));
  return { cards, cardMap, banners, salary };
}

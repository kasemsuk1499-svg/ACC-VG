// ใส่ GitHub Raw URL ตรงนี้เมื่ออัปโหลด data/ ขึ้น GitHub แล้ว
// ถ้าเว้นว่าง ระบบจะโหลดจากไฟล์ local ในโฟลเดอร์ data/
export const DATA_SOURCE = {
  cardsUrl: '',
  bannersUrl: '',
  salaryUrl: '',
  useLocalFallback: true,
  local: {
    cardsUrl: './data/cards/anime-core.json',
    bannersUrl: './data/packs/banners.json',
    salaryUrl: './data/economy/salary.json'
  }
};

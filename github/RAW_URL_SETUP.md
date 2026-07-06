# วิธีใช้ GitHub เป็นฐานข้อมูลการ์ดแบบ Raw JSON

## 1. สร้าง repo เช่น

```text
anime-card-data
```

## 2. วางไฟล์ตามนี้

```text
data/cards/anime-core.json
data/packs/banners.json
data/economy/salary.json
assets/cards/...
assets/banners/...
```

## 3. เปิดไฟล์บน GitHub แล้วกด Raw

URL จะหน้าตาประมาณนี้:

```text
https://raw.githubusercontent.com/USER/anime-card-data/main/data/cards/anime-core.json
```

## 4. เอา URL ไปใส่ใน `config/data-source.js`

```js
export const DATA_SOURCE = {
  cardsUrl: 'https://raw.githubusercontent.com/USER/anime-card-data/main/data/cards/anime-core.json',
  bannersUrl: 'https://raw.githubusercontent.com/USER/anime-card-data/main/data/packs/banners.json',
  salaryUrl: 'https://raw.githubusercontent.com/USER/anime-card-data/main/data/economy/salary.json',
  useLocalFallback: true,
  local: {
    cardsUrl: './data/cards/anime-core.json',
    bannersUrl: './data/packs/banners.json',
    salaryUrl: './data/economy/salary.json'
  }
};
```

## แนะนำ

- ถ้าจะทำระบบ Admin ให้แก้ข้อมูลผ่านหน้าเว็บ แล้ว commit กลับ GitHub ต้องใช้ GitHub API หรือทำผ่าน Firebase ก่อน
- ถ้าใช้ GitHub Raw อย่างเดียว เหมาะกับข้อมูล public เช่น การ์ด/แบนเนอร์/สูตรระบบ
- ข้อมูลผู้เล่น เช่น ownedCards, gem, deck, room state ควรอยู่ Firebase ไม่ควรอยู่ GitHub

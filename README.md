# ANIME CARD COLLECTION Fight System Starter

ระบบต้นแบบสำหรับเกมการ์ดอนิเมะแนว Card Battle แบบ Grade / Ride Path / Trigger / Support โดยแยกข้อมูลการ์ดกับระบบเกมออกจากกัน เพื่ออัปเดตข้อมูลผ่าน GitHub ได้ง่าย

> หมายเหตุ: โปรเจกต์นี้เป็นระบบต้นฉบับสำหรับพัฒนาเกมของคุณเอง ไม่ได้ใช้ชื่อกฎ/คำเฉพาะ/ข้อความการ์ดของเกมเชิงพาณิชย์โดยตรง

## โครงหลัก

- `data/` เก็บข้อมูลการ์ด แบนเนอร์กาชา และสูตรเงินเดือน
- `game/` เก็บระบบเกม เช่น deck, fight engine, skill engine, AI, multiplayer, gacha, salary
- `app/` เก็บ UI ที่ดึงระบบเกมมาใช้
- `config/` เก็บ config Firebase/GitHub
- `github/` อธิบายวิธีเอา JSON ไปวางบน GitHub แล้วดึงกลับมาใช้

## ระบบที่มีในต้นแบบ

- Battle Deck 50 ใบ
- Anime Path Deck Grade 0-3 สำหรับขี่ร่างตามลำดับ
- Damage 6 แพ้
- Trigger: CRIT, DRAW, HEAL, FRONT, OVER
- Persona-like system เปลี่ยนชื่อเป็น `resonanceRide`
- Support Unit วางหลังแถวหน้าและช่วย Boost / เปิดสกิลซัพพอร์ต
- กาชา + pity + rate ตาม banner
- เงินเดือน/รายได้จากการ์ดที่มีอยู่
- AI เบื้องต้น
- Firebase room skeleton สำหรับเล่นกับเพื่อนแบบ real-time

## วิธีรันเร็ว

เปิดด้วย local server เช่น:

```bash
python -m http.server 8080
```

แล้วเข้า:

```text
http://localhost:8080/anime-cardfight-starter/
```

ถ้าเอาขึ้น GitHub Pages ให้เปิด `index.html` ได้เลย

## การต่อ GitHub Raw Data

เปิดไฟล์ `config/data-source.js` แล้วใส่ URL จาก GitHub raw เช่น:

```js
export const DATA_SOURCE = {
  cardsUrl: 'https://raw.githubusercontent.com/USER/REPO/main/data/cards/anime-core.json',
  bannersUrl: 'https://raw.githubusercontent.com/USER/REPO/main/data/packs/banners.json',
  salaryUrl: 'https://raw.githubusercontent.com/USER/REPO/main/data/economy/salary.json'
};
```

ดูตัวอย่างเต็มใน `github/RAW_URL_SETUP.md`

## แนวคิดแทน Nation

ระบบนี้ไม่แยก Nation แต่ใช้ `styleTags` แทน เช่น:

- `SHONEN`
- `ISEKAI`
- `MAGIC`
- `ACADEMY`
- `DARK`
- `SCI_FI`
- `IDOL`
- `CREATOR`

Deck สามารถตั้ง rule ได้ว่าเล่นแบบ:

1. Free Anime Mix: ใส่ได้ทุกแท็ก
2. Theme Deck: ต้องมีแท็กหลักเดียวกันอย่างน้อย 70%
3. Leader Lock: การ์ดซัพพอร์ตต้องตรงกับ `leaderTags` ของ Grade 3

## งานต่อที่แนะนำ

1. เพิ่ม UI สนามจริง 3 หน้า 3 หลัง
2. เพิ่มระบบล็อกอิน Firebase Auth
3. เพิ่มห้อง PvP แบบ action log + sync state
4. เพิ่มตัวแก้ข้อมูลการ์ดแบบ Admin
5. เชื่อมกับโปรเจกต์ ANIME CARD COLLECTION เดิม เช่น collection, gacha, salary

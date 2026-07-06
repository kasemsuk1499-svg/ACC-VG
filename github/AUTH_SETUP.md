# Firebase Auth Setup สำหรับ GitHub Pages

ระบบล็อคอินใน Starter นี้ใช้ Firebase Authentication + Google Sign-In และมี Guest Mode สำรอง

## 1) เปิด Google Sign-In

Firebase Console → Build → Authentication → Sign-in method → Google → Enable

## 2) เพิ่ม Authorized domain

Firebase Console → Build → Authentication → Settings → Authorized domains

เพิ่มโดเมน GitHub Pages ของคุณ เช่น

```text
kasemsuk1499-svg.github.io
```

ถ้าไม่เพิ่มโดเมนนี้ Google Login จะขึ้น error ตอนใช้งานบน GitHub Pages

## 3) ตั้งค่า config

ไฟล์ที่ใช้จริงคือ

```text
config/firebase-config.js
```

ตัวอย่างที่ใส่แล้วในโปรเจกต์นี้:

```js
export const firebaseConfig = {
  apiKey: '...',
  authDomain: 'anime-vg.firebaseapp.com',
  projectId: 'anime-vg',
  storageBucket: 'anime-vg.firebasestorage.app',
  messagingSenderId: '5444647133',
  appId: '1:5444647133:web:4a25e8a66c9603d15d0334',
  measurementId: 'G-9L5JPYS1QD',
  databaseURL: 'https://anime-vg-default-rtdb.firebaseio.com'
};
```

> หมายเหตุ: Firebase Web config ไม่ใช่ private key แต่ต้องตั้ง Security Rules ให้ดีเมื่อเริ่มบันทึกข้อมูลผู้เล่นลง Database จริง

## 4) โหมดที่มีตอนนี้

- Google Login: ใช้ Firebase Auth
- Guest Login: ใช้ localStorage ในเครื่อง
- โปรไฟล์/เงิน/การ์ด/เด็คตอนนี้บันทึกใน localStorage ก่อน
- ระบบห้องเล่นกับเพื่อนผ่าน Realtime Database อยู่ใน `game/multiplayer/firebase-room.js`

ขั้นต่อไปที่ควรทำคือย้าย `profile`, `ownedCards`, `deck`, `currency` ไปเก็บใน Realtime Database หรือ Firestore ตาม UID จริง

// Skeleton สำหรับ Firebase Realtime Database
// ต้องสร้าง config/firebase-config.js เองจาก firebase-config.example.js

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  onValue,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js';
import { firebaseConfig } from '../../config/firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export async function createRoom({ roomId, hostProfile, initialState }) {
  const roomRef = ref(db, `animeFightRooms/${roomId}`);
  await set(roomRef, {
    roomId,
    status: 'waiting',
    hostUid: hostProfile.uid,
    players: {
      [hostProfile.uid]: { uid: hostProfile.uid, name: hostProfile.name || 'Host', seat: 'A', ready: false }
    },
    state: initialState || null,
    actions: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return roomId;
}

export async function joinRoom({ roomId, guestProfile }) {
  const playerPath = `animeFightRooms/${roomId}/players/${guestProfile.uid}`;
  await set(ref(db, playerPath), { uid: guestProfile.uid, name: guestProfile.name || 'Guest', seat: 'B', ready: false });
  await update(ref(db, `animeFightRooms/${roomId}`), { status: 'ready_check', updatedAt: serverTimestamp() });
}

export async function setReady({ roomId, uid, ready }) {
  await update(ref(db, `animeFightRooms/${roomId}/players/${uid}`), { ready });
}

export async function pushAction({ roomId, uid, action }) {
  const actionRef = push(ref(db, `animeFightRooms/${roomId}/actions`));
  await set(actionRef, { uid, action, createdAt: serverTimestamp() });
}

export async function syncState({ roomId, state }) {
  await update(ref(db, `animeFightRooms/${roomId}`), { state, updatedAt: serverTimestamp() });
}

export function subscribeRoom(roomId, callback) {
  return onValue(ref(db, `animeFightRooms/${roomId}`), snapshot => callback(snapshot.val()));
}

export async function readRoom(roomId) {
  const snapshot = await get(ref(db, `animeFightRooms/${roomId}`));
  return snapshot.val();
}

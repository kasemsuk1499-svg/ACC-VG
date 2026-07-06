# Room Protocol

## Firebase Path

```text
animeFightRooms/{roomId}
```

## Room State

```json
{
  "roomId": "ABC123",
  "status": "waiting | ready_check | fighting | finished",
  "players": {
    "uidA": { "name": "Player A", "seat": "A", "ready": true },
    "uidB": { "name": "Player B", "seat": "B", "ready": true }
  },
  "state": {},
  "actions": {
    "pushId": {
      "uid": "uidA",
      "action": { "type": "RIDE_FROM_PATH", "payload": { "discardIndex": 0 } }
    }
  }
}
```

## Recommended Action Types

- `START_GAME`
- `RIDE_FROM_PATH`
- `RESONANCE_RIDE_FROM_HAND`
- `CALL_FROM_HAND`
- `ATTACK_VANGUARD`
- `GUARD_FROM_HAND`
- `END_TURN`

หลักการคือให้ client ส่ง action ขึ้น Firebase แล้ว host หรือ cloud function เป็นคน validate/resolve เพื่อกันโกงในอนาคต

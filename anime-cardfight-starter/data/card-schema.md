# Card Data Schema

```json
{
  "id": "ACC-G3-MAGIC-ACE-001",
  "name": "ชื่อการ์ด",
  "rarity": "N | R | SR | SSR | UR | LR | EX | SC",
  "type": "UNIT | TRIGGER_UNIT | ORDER | SUPPORT",
  "grade": 0,
  "animeConcept": "ธีมอนิเมะ",
  "styleTags": ["MAGIC", "ACADEMY"],
  "roles": ["ACE", "SUPPORT"],
  "power": 13000,
  "shield": 0,
  "critical": 1,
  "drive": 2,
  "trigger": "CRIT | DRAW | HEAL | FRONT | OVER | null",
  "triggerPower": 10000,
  "supportPower": 8000,
  "resonanceRide": true,
  "image": "https://raw.githubusercontent.com/USER/REPO/main/assets/cards/card.png",
  "salary": {
    "coinPerHour": 40,
    "gemPerDay": 2
  },
  "skills": [
    {
      "id": "SKILL_ID",
      "name": "ชื่อสกิล",
      "timing": "onRideBy | onResonanceRide | onAttack | onBoost | onHit | onPlaced | startTurn | endTurn",
      "oncePerFight": false,
      "cost": [{ "type": "counterBlast", "value": 1 }],
      "condition": { "thisIsVanguard": true },
      "effects": [{ "type": "power", "target": "self", "value": 10000, "until": "endOfBattle" }]
    }
  ]
}
```

## Supported Cost Types

- `counterBlast`
- `soulBlast`
- `discard`

## Supported Effect Types

- `draw`
- `power`
- `critical`
- `frontRowPower`
- `counterCharge`

## Supported Condition Examples

```json
{ "thisIsVanguard": true }
{ "thisIsAttacker": true }
{ "vanguardHasTag": "MAGIC" }
{ "sourceHasTag": "SHONEN" }
```

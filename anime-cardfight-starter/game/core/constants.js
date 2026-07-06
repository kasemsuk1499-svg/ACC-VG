export const DECK_RULES = {
  mainDeckSize: 50,
  pathDeckGrades: [0, 1, 2, 3],
  maxCopies: 4,
  triggerTotal: 16,
  overTriggerMax: 1,
  healTriggerMax: 4,
  startingHand: 5,
  damageLose: 6,
  frontRowPowerOnResonance: 10000
};

export const CIRCLES = {
  VG: 'vanguard',
  FRONT_LEFT: 'frontLeft',
  FRONT_RIGHT: 'frontRight',
  BACK_LEFT: 'backLeft',
  BACK_CENTER: 'backCenter',
  BACK_RIGHT: 'backRight'
};

export const FRONT_ROW = [CIRCLES.FRONT_LEFT, CIRCLES.VG, CIRCLES.FRONT_RIGHT];
export const BACK_ROW = [CIRCLES.BACK_LEFT, CIRCLES.BACK_CENTER, CIRCLES.BACK_RIGHT];

export const TRIGGERS = ['CRIT', 'DRAW', 'HEAL', 'FRONT', 'OVER'];

export const EVENT_TIMINGS = {
  ON_RIDE_BY: 'onRideBy',
  ON_RESONANCE_RIDE: 'onResonanceRide',
  ON_ATTACK: 'onAttack',
  ON_BOOST: 'onBoost',
  ON_HIT: 'onHit',
  ON_PLACED: 'onPlaced',
  START_TURN: 'startTurn',
  END_TURN: 'endTurn'
};

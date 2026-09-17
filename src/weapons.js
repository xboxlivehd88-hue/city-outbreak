export const WEAPONS = Object.freeze({
  rifle: { name: 'Rifle', magSize: 12, startingReserve: 72, damage: 1, fireDelayMs: 105, automatic: true },
  smg: { name: 'SMG', magSize: 30, startingReserve: 90, damage: 0.75, fireDelayMs: 72, automatic: true },
  shotgun: { name: 'Shotgun', magSize: 6, startingReserve: 30, damage: 0.72, pellets: 7, fireDelayMs: 520 },
  pistol: { name: 'Pistol', magSize: 15, startingReserve: 60, damage: 1.15, fireDelayMs: 240 },
  dmr: { name: 'DMR', magSize: 10, startingReserve: 30, damage: 2.15, fireDelayMs: 330 },
});

export const AMMO_SHOP = Object.freeze({
  rifle: { amount: 36, price: 120 },
  smg: { amount: 60, price: 110 },
  shotgun: { amount: 18, price: 140 },
  pistol: { amount: 48, price: 90 },
  dmr: { amount: 24, price: 160 },
});

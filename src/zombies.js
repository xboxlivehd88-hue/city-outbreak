export const ZOMBIE_ROLES = Object.freeze({
  charger: { lead: 0.15, description: 'Direct pressure and aggressive surges.' },
  flanker: { flankDistance: 6, description: 'Moves around the player and attacks from the sides.' },
  interceptor: { lead: 2.2, description: 'Predicts player movement and cuts off escape routes.' },
  stalker: { holdDistance: 11, description: 'Hangs back and closes when the player is distracted.' },
});

export const ZOMBIE_ASSET_PLAN = Object.freeze({
  format: 'glb',
  requiredAnimations: ['idle', 'walk', 'run', 'attack', 'stagger', 'death-forward', 'death-back', 'crawl'],
  hitZones: ['head', 'torso', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'],
  dismemberment: ['head', 'leftArm', 'rightArm'],
});

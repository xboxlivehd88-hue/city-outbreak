import { GAME_CONFIG } from './config.js';
import { WEAPONS } from './weapons.js';
import { ZOMBIE_ROLES } from './zombies.js';

console.info('City Outbreak modular rebuild loaded', {
  config: GAME_CONFIG,
  weapons: Object.keys(WEAPONS),
  zombieRoles: Object.keys(ZOMBIE_ROLES),
});

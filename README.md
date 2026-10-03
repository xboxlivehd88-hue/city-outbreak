# City Outbreak

Browser-based first-person zombie survival game built with Three.js and hosted on GitHub Pages.

## Live Game

https://xboxlivehd88-hue.github.io/city-outbreak/

## Current Features

- First-person movement, sprinting, mouse aiming, ADS and pause
- Wave-based zombie survival
- Tactical zombie roles and improved city pathfinding
- Limb damage, detachable limbs, crawlers, ragdolls and corpses
- Boss waves and explosive reactions
- Multiple weapons with individual viewmodels, ammo and reload behavior
- Grenades and tactical nukes
- Between-wave shop and progression
- Low-resource shop pause mode
- Parked STI vehicles and city environment
- Performance diagnostics HUD

## Active Project Structure

- `index.html` — live HTML/UI shell
- `src/game.css` — live game styling
- `src/game.js` — live main runtime; current proven audio remains inline here
- `src/audio.js` — experimental audio extraction file; NOT currently used by the live game
- `src/zombie-rig-data.js` — exact live embedded zombie rig data
- `assets/` — models, textures and start-screen artwork
- `CITY_OUTBREAK_HANDOFF.md` — authoritative current development handoff
- `src/config.js`, `src/main.js`, `src/weapons.js`, `src/zombies.js` — older scaffold files; not yet part of the live runtime
- `build/game.part*` — old build fragments; not currently loaded by the live game
- `HANDOFF.md` / `NEXT_CHAT_HANDOFF.md` — compatibility pointers to the authoritative handoff

## Development Rule

Always read `CITY_OUTBREAK_HANDOFF.md` and fetch the newest live files before making changes. The modular split has begun; do not assume all gameplay code still lives in `index.html`.

Continue modularization incrementally from tested checkpoints rather than as a full rewrite.

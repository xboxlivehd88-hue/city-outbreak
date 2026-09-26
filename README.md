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

- `index.html` — **current live gameplay source and runtime**
- `assets/` — models, textures and start-screen artwork
- `CITY_OUTBREAK_HANDOFF.md` — authoritative current development handoff
- `src/` — old/incomplete modularization scaffolding; **not currently loaded by the live game**
- `build/game.part*` — old build fragments; **not currently loaded by the live game**
- `HANDOFF.md` / `NEXT_CHAT_HANDOFF.md` — compatibility pointers to the authoritative handoff

## Development Rule

Always fetch the newest `main:index.html` and read `CITY_OUTBREAK_HANDOFF.md` before making changes. The game is currently tuned through direct, targeted edits to the live root `index.html`.

A future modular code split is recommended, but it should be done incrementally from a known-good build rather than as a full rewrite.

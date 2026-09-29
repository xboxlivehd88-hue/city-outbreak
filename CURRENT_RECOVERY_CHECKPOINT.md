# CITY OUTBREAK — CURRENT RECOVERY CHECKPOINT

## Protected recovery: v324

This file is the short-form recovery pointer. For full details read `CITY_OUTBREAK_HANDOFF.md` and `NEXT_CHAT_HANDOFF.md`.

- Approved recovery build: **v324**
- Protected gameplay commit: `afddcebb47e06a82b4196638716f05e6f1adc941`
- Protected gameplay tree: `5721309fc27f9f16ee7a2568a7f73fd429342502`
- Loader: `./src/game.js?v=324`
- Successful Pages deployment run: `36616387389`
- Live URL: https://xboxlivehd88-hue.github.io/city-outbreak/

The user approved this state on 2026-09-29 and explicitly requested it become the new recovery save.

## Recovery rule

If a future experiment breaks gameplay and the user asks to return to the current recovery, restore the exact protected v324 gameplay tree above. Do not substitute v303 unless the user specifically asks for the older clean fallback.

Former clean fallback:
- v303 tree: `ce560411d2751ccdc8068bfa16753cc77adeb74a`
- v303 gameplay commit: `8e0c312eab781ba978ebb7f5bf503253e0d5e955`

## Critical current identity

- City GLB: `assets/chicken_gun_fruzer_-_city.glb`
- City scale: 1.55
- Player scale: 1.20
- Zombie scale: 1.15
- Player wall radius: .36
- Zombie collision radius: .38
- Collision cell: .34
- Zombie nav cell: 1.5
- Zombie nav padding: .44
- Normal wave 1 count: 10; +3 per wave formula
- Active zombie cap: 30
- Sprint speed: 9.5
- New round restores health and sprint to 100
- Outdoor zombie spawns are restricted to real Road/ParkingBG map surfaces
- Stairs use GLB ground raycasting / `playerGroundY`

See the two handoff files for the exact implementation details and workflow rules.

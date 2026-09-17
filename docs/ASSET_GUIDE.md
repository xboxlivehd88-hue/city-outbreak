# City Outbreak Asset Guide

The next visual milestone replaces procedural box/sphere art with optimized GLB/GLTF assets.

## Zombies
Target one reusable humanoid skeleton with several interchangeable zombie meshes/material variants. Required clips: idle, walk, run, attack, stagger, death forward, death backward, crawl. Preserve named hit-zone nodes for head, torso, arms, and legs so gameplay can keep headshots, limping, and dismemberment.

## Weapons
Create first-person models for rifle, SMG, shotgun, pistol, and DMR. Each should have a clear silhouette, separate magazine where appropriate, muzzle node, eject node, sight alignment point, and animation-ready moving pieces.

## Vehicles and environment
Use optimized parked-car GLBs with collision proxies. Environment assets should be modular: road pieces, curbs, lamps, storefronts, debris, barriers, dumpsters, signs, and building facades.

## Performance budget
Prefer shared materials/textures, instancing for repeated props, compressed textures, and reasonable polygon counts. Dead bodies and detached limbs should be cleaned up after a configurable lifetime.

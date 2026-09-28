// CITY OUTBREAK pure wave/difficulty calculations.
// Stateless formulas only. Keep gameplay/stateful wave and boss logic in game.js.
export function diff(w){return{count:6+(w-1)*3,hp:3+Math.floor((w-1)*.7),speed:1.15+(w-1)*.12,attack:Math.max(.32,.86-(w-1)*.04),damage:10+Math.floor((w-1)/3)*2,strafe:Math.min(.78,(w-1)*.06),surge:Math.min(.95,(w-1)*.07)}}
export function isBossWave(w){return w>0&&w%10===0}
export function bossTier(w){return Math.max(0,Math.floor(w/10)-1)}
export function bossScaleFactor(w){return Math.pow(1.1,bossTier(w))}

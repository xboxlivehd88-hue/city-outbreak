// CITY OUTBREAK input-state utilities.
// Pure helpers only: no DOM listeners or gameplay behavior in this module.
export function clearKeyState(keys){
 for(const key in keys)keys[key]=false;
}

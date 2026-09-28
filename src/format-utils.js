// CITY OUTBREAK pure formatting utilities.
// No gameplay state or DOM behavior belongs in this module.
export function formatRunTime(ms){
 const total=Math.max(0,Math.floor(ms/1000));
 const h=Math.floor(total/3600);
 const m=Math.floor((total%3600)/60);
 const s=total%60;
 return h>0
  ?String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")
  :String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}

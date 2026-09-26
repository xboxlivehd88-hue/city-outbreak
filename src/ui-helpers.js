// CITY OUTBREAK DOM-only UI helpers.
// Keeps transient message timing out of the main gameplay runtime.
const transientMessageTimers=new WeakMap();

export function showTransientMessage(element,text,duration=1000){
 element.textContent=text;
 element.classList.add("show");
 const previous=transientMessageTimers.get(element);
 if(previous)clearTimeout(previous);
 const timer=setTimeout(()=>{
  element.classList.remove("show");
  transientMessageTimers.delete(element);
 },duration);
 transientMessageTimers.set(element,timer);
}

export function clearTransientMessage(element){
 const timer=transientMessageTimers.get(element);
 if(timer)clearTimeout(timer);
 transientMessageTimers.delete(element);
 element.classList.remove("show");
}

// CITY OUTBREAK browser rendering-lifecycle utilities.
// Owns resize/context-loss wiring only; gameplay state remains in game.js.
export function setupRendererResize({renderer,camera,target=window}){
 const resize=()=>{
  const width=target.innerWidth;
  const height=target.innerHeight;
  renderer.setSize(width,height,false);
  camera.aspect=width/height;
  camera.updateProjectionMatrix();
 };
 target.addEventListener("resize",resize);
 resize();
 return resize;
}


export function setupWebGLContextLossHandler(canvas,onContextLost){
 canvas.addEventListener("webglcontextlost",event=>{
  event.preventDefault();
  console.error("CITY OUTBREAK: WebGL context lost");
  onContextLost?.();
 });
}

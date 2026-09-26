// CITY OUTBREAK rendering utilities.
// Keeps browser resize wiring separate from gameplay state.
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

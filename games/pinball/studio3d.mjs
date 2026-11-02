// Original procedural studio environment for Neon Tilt.
 // Provides broad, believable reflected softboxes for physically based metal,
 // clearcoat and lacquer without externally hosted textures or copyrighted art.
export function createStudioEnvironment(T,renderer,scene){
 if(!T.PMREMGenerator || !T.EquirectangularReflectionMapping) return ()=>{};
 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=512;
 const c=canvas.getContext('2d');
 if(!c)return ()=>{};
 const background=c.createLinearGradient(0,0,0,512);
 background.addColorStop(0,'#353e51');
 background.addColorStop(.27,'#1b202c');
 background.addColorStop(.48,'#0a0c13');
 background.addColorStop(.78,'#29202a');
 background.addColorStop(1,'#15121a');
 c.fillStyle=background;c.fillRect(0,0,1024,512);
 // Tall, wide diffused lighting banks. These yield long highlight streaks on
 // chrome ramp wires and distinct softbox reflections on clear-coated plastics.
 for(const [x,width,y,height,strength] of [
  [66,150,65,250,.74],[325,95,45,325,.55],
  [580,186,50,300,.86],[875,92,93,260,.62]
 ]){
  const glow=c.createLinearGradient(x,0,x+width,0);
  glow.addColorStop(0,'rgba(255,244,228,0)');
  glow.addColorStop(.17,'rgba(255,239,219,'+(strength*.52)+')');
  glow.addColorStop(.38,'rgba(255,250,243,'+strength+')');
  glow.addColorStop(.62,'rgba(225,233,255,'+strength+')');
  glow.addColorStop(.85,'rgba(250,235,222,'+(strength*.4)+')');
  glow.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=glow;c.fillRect(x,y,width,height);
 }
 const tableFill=c.createLinearGradient(0,0,0,100);
 tableFill.addColorStop(0,'rgba(255,238,202,.21)');
 tableFill.addColorStop(1,'rgba(255,238,202,0)');
 c.fillStyle=tableFill;c.fillRect(0,0,1024,85);
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 texture.mapping=T.EquirectangularReflectionMapping;
 const pmrem=new T.PMREMGenerator(renderer);
 const target=pmrem.fromEquirectangular(texture);
 scene.environment=target.texture;
 scene.environmentIntensity=.8;
 texture.dispose();
 pmrem.dispose();
 return ()=>{if(scene.environment===target.texture)scene.environment=null;target.dispose()};
}

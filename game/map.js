import * as THREE from 'three';
import {MapEffects} from './map-effects.js';
import {resourceTextureSVG,RESOURCE_LABELS} from './icons.js';

const W=1080,H=520;
export class WorldStage {
  constructor(host,world,onSelect,onCollect) {
    this.host=host;this.world=world;this.onSelect=onSelect;this.onCollect=onCollect;this.zoom=1;this.cx=540;this.cy=260;this.meshes=[];this.dirty=true;this.time=0;this.points=new Map();
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.setClearColor(0x071d24,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Carte mondiale interactive : toucher un pays pour le sélectionner, glisser pour déplacer, pincer pour zoomer.');
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-540,540,260,-260,.1,100);this.camera.position.z=20;
    this.land=new THREE.Group();this.scene.add(this.land);this.ray=new THREE.Raycaster();this.pointer=new THREE.Vector2();
    const borderMat=new THREE.LineBasicMaterial({color:0x46847d,transparent:true,opacity:.55});
    world.forEach((country,i)=>{
      const path=new THREE.ShapePath();const parts=country.path.match(/[MLZ][^MLZ]*/g)||[];
      for(const part of parts){const xy=part.slice(1).split(',').map(Number);if(part[0]==='M')path.moveTo(xy[0],-xy[1]);else if(part[0]==='L')path.lineTo(xy[0],-xy[1]);else path.currentPath?.closePath();}
      const shapes=path.toShapes(false);if(!shapes.length)shapes.push(new THREE.Shape().absarc(country.x,-country.y,1.8,0,Math.PI*2,false));
      const geo=new THREE.ShapeGeometry(shapes);const mat=new THREE.MeshBasicMaterial({color:i%3===0?0x234749:0x1a3b40,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(geo,mat);mesh.userData.country=country;this.land.add(mesh);this.meshes.push(mesh);
      for(const shape of shapes){const pts=shape.getPoints();if(pts.length>1){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(p.x,p.y,.1))),borderMat);this.land.add(line);}}
    });
    this.resourceTextures=Object.fromEntries(Object.keys(RESOURCE_LABELS).map(key=>{const texture=new THREE.TextureLoader().load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(resourceTextureSVG(key)));texture.colorSpace=THREE.SRGBColorSpace;return [key,texture];}));
    this.markerGroup=new THREE.Group();this.scene.add(this.markerGroup);this.routeGroup=new THREE.Group();this.scene.add(this.routeGroup);
    this.activity=new MapEffects(this.scene,world);this.snapshot=null;this.effects=new THREE.Group();this.scene.add(this.effects);
    this.selection=new THREE.Mesh(new THREE.RingGeometry(9,10,48),new THREE.MeshBasicMaterial({color:0xf7da8e,transparent:true,opacity:.9}));this.selection.position.z=2;this.scene.add(this.selection);
    this.home=new THREE.Sprite(new THREE.SpriteMaterial({color:0xffffff}));this.home.scale.set(36,48,1);this.home.position.z=3;this.scene.add(this.home);
    new THREE.TextureLoader().load('./assets/art/relics-final.png',tex=>{if(this.disposed){tex.dispose();return;}tex.colorSpace=THREE.SRGBColorSpace;this.relicTexture=tex;this.setNation(this.nation||'FR');});
    const stars=new Float32Array(240*3);for(let i=0;i<240;i++){stars[i*3]=Math.random()*1400-150;stars[i*3+1]=-Math.random()*760+100;stars[i*3+2]=-2;}
    this.stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(stars,3)),new THREE.PointsMaterial({color:0xc5ba81,size:1.5,transparent:true,opacity:.45}));this.scene.add(this.stars);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.bind();this.resize();
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.host.dispatchEvent(new CustomEvent('renderer-lost'));});
  }
  setNation(nation){this.nation=nation;const c=this.world.find(c=>c.id===nation);if(c)this.home.position.set(c.x,-c.y-4,3);if(this.relicTexture){const index=['FR','GB','US','IT','CN','RU','MX'].indexOf(nation);const t=this.relicTexture.clone();t.repeat.set(.25,.5);t.offset.set(index%4*.25,index<4?.5:0);t.needsUpdate=true;this.home.material.map?.dispose();this.home.material.map=t;this.home.material.needsUpdate=true;}}
  resize(){const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.aspect=w/h;this.updateCamera();}
  updateCamera(){const halfW=Math.max(565,300*this.aspect)/this.zoom;const halfH=halfW/this.aspect;this.camera.left=-halfW;this.camera.right=halfW;this.camera.top=halfH;this.camera.bottom=-halfH;this.camera.position.set(this.cx,-this.cy,20);this.camera.updateProjectionMatrix();}
  pan(x,y){this.cx=Math.max(0,Math.min(W,this.cx+x/this.zoom));this.cy=Math.max(0,Math.min(H,this.cy+y/this.zoom));this.updateCamera();}
  zoomBy(amount){this.host.dispatchEvent(new CustomEvent('map-zoom'));this.zoom=Math.max(.75,Math.min(5,this.zoom*amount));this.updateCamera();}
  reset(){this.zoom=1;this.cx=540;this.cy=260;this.updateCamera();}
  focus(id){const c=this.world.find(c=>c.id===id);if(c){this.cx=c.x;this.cy=c.y;this.updateCamera();}}
  hit(x,y){const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObjects([...this.markerGroup.children,...this.meshes],false)[0];return hit?.object;}
  bind(){const el=this.renderer.domElement;let origin=null,last=null,moved=false,pinch=0;
    el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});origin=last={x:e.clientX,y:e.clientY};moved=false;if(this.points.size===2){const p=[...this.points.values()];pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);moved=true;}});
    el.addEventListener('pointermove',e=>{if(!this.points.has(e.pointerId))return;this.points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.points.size===2){const p=[...this.points.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);if(pinch)this.zoomBy(d/pinch);pinch=d;moved=true;return;}if(last){if(Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>6)moved=true;if(moved){const scale=(this.camera.right-this.camera.left)/el.clientWidth;this.pan((last.x-e.clientX)*scale*this.zoom,(last.y-e.clientY)*scale*this.zoom);}last={x:e.clientX,y:e.clientY};}});
    const release=e=>{if(!this.points.has(e.pointerId))return;this.points.delete(e.pointerId);if(!moved&&e.type!=='pointercancel'){const hit=this.hit(e.clientX,e.clientY);if(hit?.userData.bubble)this.onCollect(hit.userData.bubble);else if(hit?.userData.country)this.onSelect(hit.userData.country.id);}last=null;pinch=0;};el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
    el.addEventListener('wheel',e=>{e.preventDefault();this.zoomBy(e.deltaY<0?1.12:.89);},{passive:false});
  }
  sync(s,color){
    if(this.snapshot){let emitted=0;for(const [id,c] of Object.entries(s.countries)){const before=this.snapshot.influence[id];if(before<100&&c.influence>=100&&emitted++<6)this.activity.emit('conversion',id);else if(before===0&&c.influence>0&&emitted++<6)this.activity.emit('tourist',id,s.nation);}if(s.integrity<this.snapshot.integrity)this.activity.emit('impact',s.nation);if(s.research.length>this.snapshot.research)this.activity.emit('research',s.nation);for(const p of s.planes)if(!this.snapshot.planes.includes(p.id))this.activity.emit('impact',p.from);}
    this.snapshot={influence:Object.fromEntries(Object.entries(s.countries).map(([id,c])=>[id,c.influence])),integrity:s.integrity,research:s.research.length,planes:s.planes.map(p=>p.id)};
    this.state=s;const accent=new THREE.Color(color),base=new THREE.Color(0x1d3b40);for(const mesh of this.meshes){const id=mesh.userData.country.id,inf=s.countries[id].influence;mesh.material.color.copy(base).lerp(accent,inf>0?.25+inf/140:0);if(id===s.selected)mesh.material.color.lerp(new THREE.Color(0xfce3a3),.5);}
    const c=this.world.find(c=>c.id===s.selected);if(c)this.selection.position.set(c.x,-c.y,2);
    for(const obj of [...this.markerGroup.children]){this.markerGroup.remove(obj);obj.geometry?.dispose();obj.material?.dispose();}
    const occupied=new Map();for(const b of s.bubbles){const offset=occupied.get(b.country)||0;occupied.set(b.country,offset+1);const c=this.world.find(c=>c.id===b.country);const mesh=new THREE.Sprite(new THREE.SpriteMaterial({map:this.resourceTextures[b.resource],depthTest:false}));mesh.renderOrder=5;mesh.position.set(c.x+offset*18,-c.y+9,4);mesh.userData.bubble=b.id;this.markerGroup.add(mesh);}
    for(const obj of [...this.routeGroup.children]){this.routeGroup.remove(obj);obj.geometry.dispose();obj.material.dispose();}
    const home=this.world.find(c=>c.id===s.nation);for(const p of s.planes){const from=this.world.find(c=>c.id===p.from);const t=1-p.eta/p.total;const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(from.x,-from.y,1),new THREE.Vector3((from.x+home.x)/2,-Math.min(from.y,home.y)+60,1),new THREE.Vector3(home.x,-home.y,1));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(40)),new THREE.LineBasicMaterial({color:0xff6f68,transparent:true,opacity:.6}));this.routeGroup.add(line);const bolt=new THREE.Mesh(new THREE.OctahedronGeometry(5),new THREE.MeshBasicMaterial({color:0xff7e68}));bolt.position.copy(curve.getPoint(t));bolt.position.z=4;this.routeGroup.add(bolt);}
  }
  burst(id){const c=this.world.find(c=>c.id===id);if(!c)return;for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(8,9,48),new THREE.MeshBasicMaterial({color:0xfed68a,transparent:true,opacity:.9,depthWrite:false}));ring.position.set(c.x,-c.y,5);ring.userData.age=-i*.18;this.effects.add(ring);}}
  playEffect(type,id,from){this.activity.emit(type,id,from);}
  setEvent(id,country){if(id&&!this.activity.event)this.eventView={cx:this.cx,cy:this.cy,zoom:this.zoom};this.activity.setEvent(id,country);if(!id&&this.eventView){Object.assign(this,this.eventView);this.eventView=null;this.updateCamera();}}
  frameEvent(id,compact){const c=this.world.find(c=>c.id===id);if(!c)return;this.cx=c.x+(compact?0:170/this.zoom);this.cy=c.y+(compact?(this.camera.top-this.camera.bottom)*.35:0);this.updateCamera();}
  dispose(){this.disposed=true;this.activity.dispose();this.resizeObserver.disconnect();this.scene.traverse(obj=>{obj.geometry?.dispose();if(obj.material){const materials=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of materials){m.map?.dispose();m.dispose();}}});Object.values(this.resourceTextures).forEach(t=>t.dispose());this.relicTexture?.dispose();this.renderer.dispose();}
  render(dt,reduced){this.time+=dt;this.activity.update(dt,reduced,(this.camera.right-this.camera.left)/Math.max(1,this.host.clientWidth));this.stars.material.opacity=reduced?.45:.35+Math.sin(this.time*.7)*.1;this.selection.rotation.z+=reduced?0:dt*.22;const pulse=reduced?1:1+Math.sin(this.time*2)*.08;this.selection.scale.setScalar(pulse);this.markerGroup.children.forEach(m=>{const size=22*(this.camera.right-this.camera.left)/Math.max(1,this.host.clientWidth);m.scale.set(size,size,1);});for(const ring of [...this.effects.children]){ring.userData.age+=dt;const age=ring.userData.age;ring.visible=age>=0;if(age>1.3){this.effects.remove(ring);ring.geometry.dispose();ring.material.dispose();}else if(age>=0){ring.scale.setScalar(reduced?1:1+age*4);ring.material.opacity=(1-age/1.3)*.8;}}this.renderer.render(this.scene,this.camera);}
}

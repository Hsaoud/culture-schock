import * as THREE from 'three';
import {icon} from './icons.js';

const palette={tourist:'#8bd7e8',debate:'#f3ba72',chain:'#d3b2f2',repair:'#ee969f',intercept:'#a7e2aa',calm:'#e6e4c0',food:'#f3ba72',viral:'#ee8fc1',counter:'#d3b2f2',summit:'#8bd7e8',research:'#68e7e4',conversion:'#f4bb68',impact:'#fb8066'};
const symbols={food:'lantern',viral:'buzz',counter:'tourist',summit:'calm',research:'insight',conversion:'pride',impact:'intercept'};

export class MapEffects {
  constructor(scene,world){this.world=world;this.group=new THREE.Group();scene.add(this.group);this.items=[];this.textures=new Map();this.event=null;this.clock=0;}
  texture(type){if(!this.textures.has(type)){const svg=icon(symbols[type]||type).replace('viewBox=','width="128" height="128" viewBox=').replaceAll('currentColor',palette[type]||'#f4bb68').replace('<g fill=','<style>.icon-cut{fill:#102d35;stroke:none}</style><g fill=');const t=new THREE.TextureLoader().load('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));t.colorSpace=THREE.SRGBColorSpace;this.textures.set(type,t);}return this.textures.get(type);}
  at(id){const c=this.world.find(c=>c.id===id);return c?new THREE.Vector3(c.x,-c.y,6):null;}
  emit(type,id,fromId=null){const at=this.at(id);if(!at)return;while(this.items.length>=32)this.remove(this.items[0]);const group=new THREE.Group();group.position.copy(at);this.group.add(group);
    const ring=new THREE.Mesh(new THREE.RingGeometry(8,9,40),new THREE.MeshBasicMaterial({color:palette[type]||'#f4bb68',transparent:true,depthTest:false}));group.add(ring);
    const badge=new THREE.Sprite(new THREE.SpriteMaterial({map:this.texture(type),transparent:true,depthTest:false}));badge.renderOrder=10;group.add(badge);
    const sparks=[];for(let i=0;i<8;i++){const spark=new THREE.Mesh(new THREE.PlaneGeometry(2,4),new THREE.MeshBasicMaterial({color:i%2?'#ffe5ae':palette[type]||'#f4bb68',transparent:true,depthTest:false}));spark.rotation.z=i;group.add(spark);sparks.push(spark);}
    const from=fromId&&this.at(fromId);let route=null,curve=null;if(from&&fromId!==id){curve=new THREE.QuadraticBezierCurve3(from,new THREE.Vector3((at.x+from.x)/2,Math.max(at.y,from.y)+55,6),at);route=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),new THREE.LineBasicMaterial({color:palette[type]||'#f4bb68',transparent:true,opacity:.5,depthTest:false}));this.group.add(route);}
    this.items.push({group,ring,badge,sparks,route,curve,at,age:0,duration:curve?3.5:3});
  }
  setEvent(id,country){if(this.event?.id===id&&this.event?.country===country)return;this.event=id?{id,country,next:0}:null;}
  update(dt,reduced,units){this.clock+=dt;if(this.event&&this.clock>=this.event.next){this.emit(this.event.id,this.event.country);if(!reduced){const guests=['US','CN','FR','IT','MX','RU','GB'].filter(id=>id!==this.event.country).slice(0,3);if(['viral','summit'].includes(this.event.id))guests.forEach(id=>this.emit(this.event.id,id,this.event.country));if(this.event.id==='counter')guests.slice(0,2).forEach(id=>this.emit('tourist',this.event.country,id));}this.event.next=this.clock+(reduced?60:4.5);}
    for(const item of [...this.items]){item.age+=dt;const t=item.age/item.duration;if(t>=1){this.remove(item);continue;}const fade=Math.min(1,(1-t)*4);item.badge.scale.setScalar(30*units);item.badge.material.opacity=fade;item.ring.material.opacity=fade*.65;item.ring.scale.setScalar(units*(reduced?2:1+t*6));
      if(item.curve&&!reduced){const position=item.curve.getPoint(Math.min(1,t*1.6));item.badge.position.copy(position.sub(item.at));}else item.badge.position.set(0,reduced?0:t*22*units,0);
      item.sparks.forEach((spark,i)=>{spark.visible=!reduced;const angle=i*Math.PI/4;const spread=(10+t*40)*units;spark.position.set(Math.cos(angle)*spread,Math.sin(angle)*spread-t*t*25*units,0);spark.rotation.z+=dt*(i%2?2:-2);spark.scale.setScalar(units);spark.material.opacity=fade*.85;});if(item.route)item.route.material.opacity=fade*.45;
    }
  }
  remove(item){item.group.traverse(obj=>{obj.geometry?.dispose();obj.material?.dispose();});this.group.remove(item.group);if(item.route){this.group.remove(item.route);item.route.geometry.dispose();item.route.material.dispose();}this.items.splice(this.items.indexOf(item),1);}
  dispose(){for(const item of [...this.items])this.remove(item);for(const t of this.textures.values())t.dispose();this.group.removeFromParent();}
}

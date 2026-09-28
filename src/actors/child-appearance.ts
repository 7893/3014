import { Graphics } from "pixi.js";
import type { Spine } from "@esotericsoftware/spine-pixi-v8";

/** Original vector artwork; no upstream example images are used. */
export function dressChild(actor: Spine, index: number) {
  for(const slot of actor.skeleton.data.slots) {
    const name=slot.name, length=slot.boneData.length, far=name.startsWith('rear')||name==='gun';
    const skin=far?0xac8769:0xc5a17e;
    const g=new Graphics();
    if(name==='shorts') g.ellipse(0,0,42,22).fill(0x77705c);
    else if(name==='torso') {
      g.roundRect(-10,-32,140,64,22).fill((index ? 0xb3967b : 0x7b9690));
      g.moveTo(8,-12).lineTo(110,-15).stroke({width:9,color:0xb8c2a2,alpha:.3});
    } else if(name==='head') {
      g.ellipse(62,0,70,62).fill(skin);
      g.ellipse(62,55,15,12).fill(skin);
      g.ellipse(99,-13,38,58).fill(0x4e4a3a);
      g.ellipse(48,-14,12,10).fill(0xb38f70);
    } else if(name==='gun'||name==='front-fist') g.ellipse(10,0,19,15).fill(skin);
    else if(name.endsWith('foot')) g.ellipse(23,-5,38,14).fill(far?0xbba886:0xdbcca8);
    else {
      const thick=name.endsWith('thigh')?35:name.endsWith('shin')?23:name==='neck'?21:22;
      g.moveTo(0,0).lineTo(length,0).stroke({width:thick,color:skin,cap:'round'});
      if(name.endsWith('thigh'))g.moveTo(0,0).lineTo(length*.4,0).stroke({width:thick+7,color:far?0x6a705c:0x77705c,cap:'round'});
    }
    actor.addSlotObject(name,g);
  }
}

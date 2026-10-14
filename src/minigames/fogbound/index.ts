import { h, s } from "../../lib/dom";
import type { Minigame } from "../types";
import { createGame, move, interact, radius, visibility, WORLD, type Game } from "./game";
import "./fogbound.css";

function mount(el: HTMLElement): () => void {
  let game=createGame(true), running=false, paused=false;
  const keys=new Set<string>();
  let pointerDirection: [number,number]=[0,0];
  const fog=h("input",{type:"checkbox",checked:true,"data-mechanic":"fog-of-war"});
  const start=h("button",{type:"button","data-start":"",class:"fog-primary"},"Take torch & compass");
  const pause=h("button",{type:"button"},"Pause"); pause.disabled=true;
  const status=h("p",{"data-status":"",class:"fog-status",role:"status"});
  const counts=h("p",{class:"fog-counts"});
  const board=h("div",{tabindex:0,"data-board":"",class:"fog-board",role:"group","aria-label":"Expedition. WASD or arrows to move. Space or E to interact."});
  const svg=s("svg",{viewBox:"0 0 16 12","aria-hidden":"true",class:"fog-world"});
  const defs=s("defs");
  const world=s("g"); const tiles: SVGRectElement[]=[];
  for(let y=0;y<WORLD.height;y++) for(let x=0;x<WORLD.width;x++) {
    const tile=s("rect",{x,y,width:1,height:1}); tiles.push(tile); world.append(tile);
  }
  const entities=s("g"); world.append(entities);
  const halo=s("circle",{cx:8,cy:6,r:2.8,fill:"none",stroke:"#f6d583","stroke-width":0.025,opacity:0.5});
  const player=s("circle",{cx:8,cy:6,r:0.2,fill:"#fff4c8",stroke:"#ac792d","stroke-width":0.06});
  const compass=s("g");
  svg.append(defs,world,halo,player,compass); board.append(svg);
  const legend=h("p",{class:"fog-legend"},"Gold: chest · Red: sealed outpost · Blue: opened · Dim: explored terrain");
  const action=h("button",{type:"button",class:"fog-primary","data-interact":""},"Pulse / open chest");
  const pad=h("div",{class:"fog-pad","aria-label":"Movement controls"});
  const buttons: [string,number,number][]=[["↖",-1,-1],["↑",0,-1],["↗",1,-1],["←",-1,0],["·",0,0],["→",1,0],["↙",-1,1],["↓",0,1],["↘",1,1]];
  for(const [label,dx,dy] of buttons) {
    const btn=h("button",{type:"button","aria-label":dx===0&&dy===0 ? "Stop" : `Move ${dy<0?"north":dy>0?"south":""}${dx<0?"west":dx>0?"east":""}`},label);
    btn.addEventListener("pointerdown",e=>{e.preventDefault(); if(running&&!paused) { pointerDirection=[dx,dy]; move(game,dx,dy,0.12); render(); } });
    btn.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ") { e.preventDefault(); if(running&&!paused) {move(game,dx,dy,0.25);render();} }});
    pad.append(btn);
  }
  const reflection=h("section",{class:"fog-reflection",hidden:true},
    h("h4",{},"What did you discover?"),
    h("p",{"data-result":""}),
    h("p",{},"Where did you choose to leave the compass route? What did you feel before and after opening a chest?"),
    h("p",{},"Try again with fog off. What changed in your route, curiosity or frustration? The second round may be easier because you remember the layout."));
  const root=h("div",{class:"fogbound"},
    h("header",{class:"fog-heading"},h("div",{},h("h3",{},"Fogbound"),h("p",{},"Leave a light. Find what lies between.")),
      h("label",{class:"fog-toggle"},fog," Fog of war")),
    h("p",{class:"fog-instructions"},"Open two outposts with three pulses each. Look for four optional relics. WASD / arrows: move · Space / E: interact. Mouse and touch: hold direction buttons."),
    board,counts,status,
    h("div",{class:"fog-controls"},pad,h("div",{class:"fog-actions"},action,start,pause)),legend,reflection);
  el.append(root);
  let lastMessage="";
  function render(): void {
    world.setAttribute("transform",`translate(${8-game.player.x} ${6-game.player.y})`);
    board.setAttribute("data-player-x",String(game.player.x));
    board.setAttribute("data-player-y",String(game.player.y));
    halo.setAttribute("r",String(radius(game))); halo.setAttribute("visibility",game.fog ? "visible":"hidden");
    player.setAttribute("r",String(0.2+game.outposts.filter(o=>o.open).length*0.035));
    tiles.forEach((tile,i)=>{
      const x=i%WORLD.width,y=Math.floor(i/WORLD.width),v=visibility(game,x,y),wall=WORLD.walls.has(`${x},${y}`);
      const color=v==="hidden"?"#101b26":wall?(v==="lit"?"#778b94":"#35434c"):(v==="lit"?((x+y)%2?"#314c52":"#2d474e"):"#1e2e37");
      tile.setAttribute("fill",color); tile.setAttribute("stroke",v==="hidden"?color:"#263c43"); tile.setAttribute("stroke-width","0.025");
    });
    entities.replaceChildren();
    const flag=(x:number,y:number,color:string,label:string)=>s("g",{},s("circle",{cx:x,cy:y,r:0.65,fill:color,opacity:0.14}),s("path",{d:`M ${x-0.15} ${y+0.3} v -0.8 l 0.6 0.2 -0.6 0.2`,fill:color,stroke:color,"stroke-width":0.07}),s("text",{x,y:y+0.9,"text-anchor":"middle","font-size":0.28,fill:color},label));
    if(visibility(game,3,19)!=="hidden") entities.append(flag(3.5,19.5,"#86c9f4","Camp"));
    for(const [i,p] of game.outposts.entries()) {
      const v=visibility(game,Math.floor(p.x),Math.floor(p.y));
      if(v==="hidden") continue;
      const marker=flag(p.x,p.y,p.open?"#86c9f4":"#ff9686",p.open?"Opened":`Outpost ${i+1} · ${p.hits}/3`);
      marker.setAttribute("opacity",v==="memory"?"0.45":"1"); entities.append(marker);
    }
    for(const c of game.chests) {
      const v=visibility(game,Math.floor(c.x),Math.floor(c.y)); if(v==="hidden") continue;
      const marker=s("g",{opacity:v==="memory"?0.4:1},
        s("rect",{x:c.x-0.25,y:c.y-0.18,width:0.5,height:0.36,rx:0.04,fill:c.open?"#625b48":"#f5c975",stroke:"#f5d99c","stroke-width":0.04}),
        s("text",{x:c.x,y:c.y+0.65,"text-anchor":"middle","font-size":0.25,fill:"#ffe1a2"},c.open?c.name:"Chest")); entities.append(marker);
    }
    compass.replaceChildren();
    const target=game.outposts.find(p=>!p.open);
    if(target) {
      const dx=target.x-game.player.x,dy=target.y-game.player.y;
      const scale=Math.max(Math.abs(dx)/6.7,Math.abs(dy)/4.7,1);
      const x=8+dx/scale,y=6+dy/scale,angle=Math.atan2(dy,dx)*180/Math.PI;
      // When on-screen but hidden, the compass remains a direction cue, not an exact marker.
      const offscreen=scale>1;
      const px=offscreen?x:8+Math.cos(angle*Math.PI/180)*5.2;
      const py=offscreen?y:6+Math.sin(angle*Math.PI/180)*4.2;
      compass.append(s("path",{d:"M -.3 -.22 L .3 0 L -.3 .22 Z",fill:"#f6d583",transform:`translate(${px} ${py}) rotate(${angle})`}));
    }
    counts.textContent=`Outposts ${game.outposts.filter(p=>p.open).length}/2    ·    Relics ${game.chests.filter(c=>c.open).length}/4    ·    Torch ${radius(game).toFixed(1)}    ·    ${Math.floor(game.elapsed)}s`;
    const text=paused?"Paused. Resume when ready.":!running?`${game.fog?"Fog on":"Fog off"}. Take your equipment to begin. Switching fog starts a fresh expedition.`:game.message;
    if(text!==lastMessage) {status.textContent=text;lastMessage=text;}
    action.disabled=!running||paused||game.finished;
    reflection.hidden=!game.finished;
    if(game.finished) {
      reflection.querySelector("[data-result]")!.textContent=`${game.fog?"Fog on":"Fog off"}: ${Math.floor(game.elapsed)} seconds, ${game.chests.filter(c=>c.open).length}/4 relics, ${Math.round(game.distance)} tiles traveled. These are run statistics, not a report of your feelings.`;
    }
  }
  const directions: Record<string,[number,number]>={w:[0,-1],ArrowUp:[0,-1],s:[0,1],ArrowDown:[0,1],a:[-1,0],ArrowLeft:[-1,0],d:[1,0],ArrowRight:[1,0]};
  const clear=()=>{keys.clear();pointerDirection=[0,0];};
  board.addEventListener("keydown",e=>{
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(directions[k]) {e.preventDefault();keys.add(k);}
    if((k===" "||k==="e")&&!e.repeat&&running&&!paused) {e.preventDefault();interact(game);render();}
  });
  board.addEventListener("keyup",e=>{keys.delete(e.key.length===1?e.key.toLowerCase():e.key);});
  board.addEventListener("blur",clear);
  window.addEventListener("blur",clear);
  window.addEventListener("pointerup",clear);
  window.addEventListener("pointercancel",clear);
  const visibilityChange=()=>{if(document.hidden) {clear();if(running&&!game.finished) {paused=true;pause.textContent="Resume";render();}}};
  document.addEventListener("visibilitychange",visibilityChange);
  start.addEventListener("click",()=>{game=createGame(fog.checked);running=true;paused=false;clear();start.textContent="Restart expedition";pause.disabled=false;pause.textContent="Pause";render();board.focus();});
  fog.addEventListener("change",()=>{game=createGame(fog.checked);running=false;paused=false;clear();start.textContent="Take torch & compass";pause.disabled=true;pause.textContent="Pause";render();});
  pause.addEventListener("click",()=>{paused=!paused;clear();pause.textContent=paused?"Resume":"Pause";render();if(!paused)board.focus();});
  action.addEventListener("click",()=>{if(running&&!paused) {interact(game);render();board.focus();}});
  let lastTick=Date.now();
  const timer=setInterval(()=>{
    const now=Date.now(),seconds=(now-lastTick)/1000;lastTick=now;
    if(!running||paused||game.finished) return;
    let [dx,dy]=pointerDirection;
    for(const k of keys) {dx+=directions[k][0];dy+=directions[k][1];}
    move(game,Math.sign(dx),Math.sign(dy),Math.min(seconds,0.1));game.elapsed+=seconds;render();
  },40);
  render();
  return ()=>{clearInterval(timer);window.removeEventListener("blur",clear);window.removeEventListener("pointerup",clear);window.removeEventListener("pointercancel",clear);document.removeEventListener("visibilitychange",visibilityChange);root.remove();};
}
export const fogbound: Minigame={slug:"fogbound",title:"Fogbound: leave a light",motivators:["discovery"],author:"JarrettChen217",mount};

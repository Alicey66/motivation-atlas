// All coordinates are in tiles. No DOM, timers, network or randomness here.
export type Point = { x: number; y: number };
type Outpost = Point & { open: boolean; hits: number };
type Chest = Point & { open: boolean; name: string; story: string; rare?: boolean };
export type Game = {
  player: Point; fog: boolean; explored: Set<string>; outposts: Outpost[];
  chests: Chest[]; supplies: number; speed: number; velocity: Point; completion: { elapsed: number; distance: number; chests: number } | null; finished: boolean; elapsed: number; distance: number; message: string;
};
const walls = new Set<string>();
const wall = (x: number, y: number, width: number, height: number) => {
  for (let j=y; j<y+height; j++) for (let i=x; i<x+width; i++) walls.add(`${i},${j}`);
};
wall(10, 11, 1, 9); wall(10, 11, 5, 1); // a short detour, open at both ends
wall(21, 4, 1, 8); wall(25, 15, 8, 1); wall(7, 5, 5, 1);
wall(16, 21, 4, 1); wall(29, 8, 4, 1);
export const WORLD = { width: 38, height: 26, walls };
const distance = (a: Point, b: Point) => Math.hypot(a.x-b.x, a.y-b.y);
export function radius(g: Game): number { return 2.8 + g.outposts.filter(p=>p.open).length * 0.7; }
export function createGame(fog: boolean): Game {
  const g: Game = {
    player: {x:3.5,y:19.5}, supplies:0, speed:0, velocity:{x:0,y:0}, completion:null, fog, explored:new Set(), finished:false, elapsed:0, distance:0,
    outposts:[{x:17.5,y:7.5,open:false,hits:0},{x:31.5,y:20.5,open:false,hits:0}],
    chests:[
      {x:6.5,y:16.5,open:false,name:"Shell",story:"A shell far from the sea. Someone carried it here."},
      {x:8.5,y:8.5,open:false,name:"Star chart",story:"The chart marks a route through the northern ruins."},
      {x:24.5,y:10.5,open:false,name:"Copper bell",story:"A bell once used to guide travelers home."},
      {x:34.5,y:18.5,open:false,name:"Last letter",story:"The letter reads: ‘Leave a light for whoever comes next.’"},
      {x:14.5,y:15.5,open:false,name:"Lantern oil",story:"A flask left by an earlier traveler."},
      {x:27.5,y:21.5,open:false,name:"Wayfinder token",story:"A mark of safe passage."},
      {x:2.5,y:3.5,open:false,rare:true,name:"North star",story:"A rare star relic tucked into the far corner."},
      {x:35.5,y:3.5,open:false,rare:true,name:"Dawn star",story:"A rare star relic, waiting beyond the ruins."},
    ],
    message:"Torch and compass ready. Follow the arrow, or explore a side path.",
  }; reveal(g); return g;
}
function lit(g: Game, x: number, y: number): boolean {
  const p={x:x+0.5,y:y+0.5};
  return distance(g.player,p)<=radius(g) || distance({x:3.5,y:19.5},p)<=2 ||
    g.outposts.some(o=>o.open && distance(o,p)<=2);
}
export function reveal(g: Game): void {
  for(let y=0;y<WORLD.height;y++) for(let x=0;x<WORLD.width;x++)
    if(lit(g,x,y)) g.explored.add(`${x},${y}`);
}
export function visibility(g: Game, x: number, y: number): "lit" | "memory" | "hidden" {
  if(!g.fog || lit(g,x,y)) return "lit";
  return g.explored.has(`${x},${y}`) ? "memory" : "hidden";
}
function walkable(x: number, y: number): boolean {
  const r=0.2;
  if(x<r || y<r || x>WORLD.width-r || y>WORLD.height-r) return false;
  for(const dx of [-r,r]) for(const dy of [-r,r])
    if(walls.has(`${Math.floor(x+dx)},${Math.floor(y+dy)}`)) return false;
  return true;
}
export function move(g: Game, dx: number, dy: number, seconds: number): void {
  if(seconds<=0)return;
  const norm=Math.hypot(dx,dy),dt=Math.min(seconds,1),maximum=2.16;
  const target={x:norm?dx/norm*maximum:0,y:norm?dy/norm*maximum:0};
  // Exponential easing is integrated exactly, so feel is independent of FPS.
  // 95% of full speed in ~120ms; stopping drift is at most 0.039 tiles.
  const tau=norm?0.04:0.018,decay=Math.exp(-dt/tau);
  const delta={x:target.x*dt+(g.velocity.x-target.x)*tau*(1-decay),y:target.y*dt+(g.velocity.y-target.y)*tau*(1-decay)};
  g.velocity={x:target.x+(g.velocity.x-target.x)*decay,y:target.y+(g.velocity.y-target.y)*decay};
  if(!norm&&Math.hypot(g.velocity.x,g.velocity.y)<0.005)g.velocity={x:0,y:0};
  const steps=Math.max(1,Math.ceil(Math.hypot(delta.x,delta.y)/0.08));
  for(let i=0;i<steps;i++) {
    const old={...g.player},x=g.player.x+delta.x/steps,y=g.player.y+delta.y/steps;
    if(walkable(x,g.player.y))g.player.x=x;else g.velocity.x=0;
    if(walkable(g.player.x,y))g.player.y=y;else g.velocity.y=0;
    g.distance+=distance(old,g.player);
  }
  g.speed=Math.hypot(g.velocity.x,g.velocity.y);
  reveal(g);
}
export function interact(g: Game): void {
  const chest=g.chests.find(c=>!c.open && distance(g.player,c)<1.3);
  if(chest) { chest.open=true; if(!chest.rare) g.supplies++; g.message=`Found ${chest.name.toLowerCase()}. ${chest.story}${chest.rare ? " ★ Rare relic collected!" : " +1 supply."}`; return; }
  const post=g.outposts.find(o=>!o.open && distance(g.player,o)<1.5);
  if(!post) { g.message="Move closer to a chest or red outpost, then press Space / E."; return; }
  if(post.hits===0) {
    if(g.supplies<1) { g.message="This outpost needs 1 supply. Find a chest nearby."; return; }
    g.supplies--;
  }
  post.hits++;
  if(post.hits<3) { g.message=`Seal weakening: ${post.hits}/3 pulses. Press again.`; return; }
  post.open=true; reveal(g);
  g.finished=g.outposts.every(o=>o.open);
  if(g.finished && !g.completion) g.completion={elapsed:g.elapsed,distance:g.distance,chests:g.chests.filter(c=>c.open).length};
  g.message=g.finished ? "Both outposts are lit. You win! Keep exploring for the remaining relics." : "Outpost opened! Your torch reaches farther. A new destination is on the compass.";
}

export function shouldShowCompass(g: Game): boolean {
  const target=g.outposts.find(p=>!p.open);
  if(!target)return false;
  const inViewport=Math.abs(target.x-g.player.x)<8 && Math.abs(target.y-g.player.y)<6;
  return !inViewport || visibility(g,Math.floor(target.x),Math.floor(target.y))==="hidden";
}

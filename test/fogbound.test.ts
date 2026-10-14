// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createGame, move, interact, visibility, reveal, radius, WORLD } from "../src/minigames/fogbound/game";
import { fogbound } from "../src/minigames/fogbound";

afterEach(() => { vi.useRealTimers(); document.body.replaceChildren(); });

describe("Fogbound rules", () => {
  it("hides unknown cells, remembers visited terrain, and reveals the viewport with fog off", () => {
    const g = createGame(true);
    expect(visibility(g, 5, 18)).toBe("lit");
    expect(visibility(g, 30, 3)).toBe("hidden");
    g.player = { x: 14.5, y: 19.5 }; reveal(g);
    expect(visibility(g, 5, 18)).toBe("memory");
    expect(visibility(g, 3, 19)).toBe("lit"); // camp keeps its own light
    g.fog = false;
    expect(visibility(g, 30, 3)).toBe("lit");
  });
  it("does not record unseen terrain just because the comparison mode is off", () => {
    const g = createGame(false); g.fog = true;
    expect(visibility(g, 30, 3)).toBe("hidden");
  });
  it("normalizes diagonal motion and blocks walls and world boundaries", () => {
    const a = createGame(true), b = createGame(true);
    move(a, 1, 0, 0.1); move(b, 1, -1, 0.1);
    expect(Math.hypot(b.player.x - 3.5, b.player.y - 19.5)).toBeCloseTo(a.player.x - 3.5);
    a.player = { x: 9.5, y: 14.5 }; move(a, 1, 0, 1);
    expect(a.player.x).toBeLessThan(10);
    a.player = { x: 0.25, y: 2.5 }; move(a, -1, 0, 1);
    expect(a.player.x).toBeGreaterThanOrEqual(0.2);
  });
  it("opens nearby outposts once, upgrades sight, and ends after both are opened", () => {
    const g = createGame(true), before = radius(g);
    interact(g); expect(g.outposts[0].hits).toBe(0);
    for (const c of g.chests.slice(0,2)) { g.player={...c};interact(g); }
    g.player = { ...g.outposts[0] };
    for (let i = 0; i < 3; i++) interact(g);
    expect(g.outposts[0].open).toBe(true); expect(radius(g)).toBeGreaterThan(before);
    interact(g); expect(radius(g)).toBe(before + 0.7);
    g.player = { ...g.outposts[1] };
    for (let i = 0; i < 3; i++) interact(g);
    expect(g.finished).toBe(true);
    const p = { ...g.player }; move(g, 1, 0, 1); expect(g.player.x).toBeGreaterThan(p.x);
    const c=g.chests.find(c=>!c.open)!;g.player={...c};interact(g);expect(c.open).toBe(true);
  });
  it("requires one supply per outpost, consumes it once, and keeps completion statistics", () => {
    const g=createGame(true);g.player={...g.outposts[0]};interact(g);expect(g.outposts[0].hits).toBe(0);
    g.player={...g.chests[0]};interact(g);expect(g.supplies).toBe(1);
    g.player={...g.outposts[0]};interact(g);expect(g.supplies).toBe(0);expect(g.outposts[0].hits).toBe(1);
    interact(g);interact(g);expect(g.outposts[0].open).toBe(true);expect(g.supplies).toBe(0);
    g.player={...g.chests[1]};interact(g);g.player={...g.outposts[1]};
    g.elapsed=75;interact(g);interact(g);interact(g);expect(g.completion?.elapsed).toBe(75);
    g.elapsed=90;expect(g.completion?.elapsed).toBe(75);
  });
  it("collects a chest only once and leaves distant chests untouched", () => {
    const g = createGame(true); interact(g);
    expect(g.chests.every(c => !c.open)).toBe(true);
    g.player = { ...g.chests[0] }; interact(g); interact(g);
    expect(g.chests.filter(c => c.open)).toHaveLength(1);
  });
  it("accelerates briefly but stops without positional drift", () => {
    const g=createGame(true);move(g,1,0,0.04);
    expect(g.player.x-3.5).toBeLessThan(2.16*0.04);
    move(g,1,0,0.2);const x=g.player.x;move(g,0,0,0.2);
    expect(g.player.x).toBe(x);expect(g.speed).toBe(0);
  });
  it("keeps supplies, collection, progression and movement identical in both fog modes", () => {
    const on=createGame(true),off=createGame(false);
    for(const g of [on,off]) {
      move(g,1,-1,0.1);g.player={...g.chests[0]};interact(g);
      g.player={...g.outposts[0]};interact(g);interact(g);interact(g);
    }
    expect(on.player).toEqual(off.player);expect(on.supplies).toBe(off.supplies);
    expect(on.chests).toEqual(off.chests);expect(on.outposts).toEqual(off.outposts);
    expect(radius(on)).toBe(radius(off));
  });
  it("has a walkable path from camp to every collectible and outpost", () => {
    const seen = new Set(["3,19"]), queue = [[3,19]];
    for (let i = 0; i < queue.length; i++) {
      const [x,y] = queue[i];
      for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx=x+dx, ny=y+dy, k=`${nx},${ny}`;
        if(nx>=0 && ny>=0 && nx<WORLD.width && ny<WORLD.height && !WORLD.walls.has(k) && !seen.has(k)) { seen.add(k); queue.push([nx,ny]); }
      }
    }
    const g=createGame(true);
    for (const p of [...g.chests,...g.outposts]) expect(seen.has(`${Math.floor(p.x)},${Math.floor(p.y)}`)).toBe(true);
  });
});

describe("Fogbound input and lifecycle", () => {
  it("starts, moves with keyboard, resets the comparison, and cleans up", () => {
    vi.useFakeTimers();
    const host=document.createElement("div"); document.body.append(host);
    const stop=fogbound.mount(host);
    host.querySelector<HTMLButtonElement>("[data-start]")!.click();
    const board=host.querySelector<HTMLElement>("[data-board]")!;
    board.dispatchEvent(new KeyboardEvent("keydown",{key:"d",bubbles:true})); vi.advanceTimersByTime(400);
    expect(Number(board.getAttribute("data-player-x"))).toBeGreaterThan(3.5);
    board.dispatchEvent(new KeyboardEvent("keyup",{key:"d",bubbles:true}));
    host.querySelector<HTMLInputElement>("[data-mechanic]")!.click();
    expect(board.getAttribute("data-player-x")).toBe("3.5");
    expect(host.querySelector("[data-status]")!.textContent).toContain("Fog off");
    stop(); expect(host.childNodes.length).toBe(0); expect(vi.getTimerCount()).toBe(0);
  });
  it("pauses on window focus loss and resumes in the viewport without losing progress", () => {
    vi.useFakeTimers();const host=document.createElement("div");document.body.append(host);const stop=fogbound.mount(host);
    host.querySelector<HTMLButtonElement>("[data-start]")!.click();
    const board=host.querySelector<HTMLElement>("[data-board]")!;
    board.dispatchEvent(new KeyboardEvent("keydown",{key:"d",bubbles:true}));vi.advanceTimersByTime(200);
    const x=board.getAttribute("data-player-x");window.dispatchEvent(new Event("blur"));vi.advanceTimersByTime(800);
    expect(board.getAttribute("data-player-x")).toBe(x);
    const resume=host.querySelector<HTMLButtonElement>("[data-resume]")!;expect(resume.hidden).toBe(false);resume.click();
    expect(document.activeElement===board).toBe(true);expect(resume.hidden).toBe(true);
    board.dispatchEvent(new KeyboardEvent("keydown",{key:"d",bubbles:true}));vi.advanceTimersByTime(200);
    expect(Number(board.getAttribute("data-player-x"))).toBeGreaterThan(Number(x));stop();
  });
  it("resumes when hiding the focused overlay triggers browser focusout", () => {
    vi.useFakeTimers();const host=document.createElement("div");document.body.append(host);const stop=fogbound.mount(host);
    host.querySelector<HTMLButtonElement>("[data-start]")!.click();window.dispatchEvent(new Event("blur"));
    const overlay=host.querySelector<HTMLButtonElement>("[data-resume]")!;
    // jsdom does not blur focused elements on hiding them. Reproduce the
    // actual in-app browser side effect at this DOM boundary only.
    Object.defineProperty(overlay,"hidden",{configurable:true,get(){return overlay.hasAttribute("hidden");},set(value:boolean){
      overlay.toggleAttribute("hidden",value);
      if(value&&document.activeElement===overlay)overlay.dispatchEvent(new FocusEvent("focusout",{bubbles:true,relatedTarget:null}));
    }});
    overlay.focus();overlay.click();
    expect(overlay.hidden).toBe(true);
    const board=host.querySelector<HTMLElement>("[data-board]")!;
    expect(document.activeElement===board).toBe(true);
    board.dispatchEvent(new KeyboardEvent("keydown",{key:"d",bubbles:true}));vi.advanceTimersByTime(200);
    expect(Number(board.getAttribute("data-player-x"))).toBeGreaterThan(3.5);stop();
  });
  it("returns movement focus after clicking an interaction and pauses safely", () => {
    vi.useFakeTimers();
    const host=document.createElement("div");document.body.append(host);
    const stop=fogbound.mount(host);
    host.querySelector<HTMLButtonElement>("[data-start]")!.click();
    const board=host.querySelector<HTMLElement>("[data-board]")!;
    const action=host.querySelector<HTMLButtonElement>("[data-interact]")!;
    action.focus();action.click();expect(document.activeElement).toBe(board);
    const pause=Array.from(host.querySelectorAll("button")).find(b=>b.textContent==="Pause")!;
    pause.click();
    board.dispatchEvent(new KeyboardEvent("keydown",{key:"d",bubbles:true}));vi.advanceTimersByTime(400);
    expect(board.getAttribute("data-player-x")).toBe("3.5");
    stop();
  });
});

import { h, s } from "../../lib/dom";
import { advance, canTurn, MOVE_MS, newGame, SEGMENTS_PER_EGG, startGame, type Direction, type SnakeState } from "./game";

const ARROWS: Record<Direction, string> = { up: "↑", right: "→", down: "↓", left: "←" };
const ROTATION: Record<Direction, number> = { up: -90, right: 0, down: 90, left: 180 };
const KEYS: Record<string, Direction | undefined> = {
  ArrowUp: "up", w: "up", ArrowRight: "right", d: "right",
  ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left",
};
const clock = (milliseconds: number) => `${Math.floor(milliseconds / 60_000)}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, "0")}`;
let mounts = 0;

interface Movement { to: SnakeState; startedAt: number; elapsed: number }

export function mountSnakePit(el: HTMLElement): () => void {
  const id = ++mounts;
  const events = new AbortController();
  const options = { signal: events.signal };
  const motion = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;
  let state = newGame(true);
  let movement: Movement | null = null;
  let queued: Direction | null = null;
  let paused = false;
  let disposed = false;
  let frameId: number | null = null;
  const goal = state.maze.eggs.length;

  const eggs = h("output", { "data-eggs": "" }, `0 / ${goal}`);
  const length = h("output", { "data-length": "" }, "3");
  const time = h("output", { "aria-label": "Time moving" }, "0:00");
  const stat = (label: string, value: HTMLElement) => h("div", { class: "snake-pit-stat" }, h("span", {}, label), value);
  const growth = h("input", { type: "checkbox", checked: true, "data-mechanic": "egg-growth" });
  const mode = h("span", {}, "Growth ON");
  const action = h("button", { type: "button", class: "snake-pit-button snake-pit-primary", "data-action": "" }, "Start escape");
  const restart = h("button", { type: "button", class: "snake-pit-button", "data-restart": "" }, "Restart");
  const status = h("p", { class: "snake-pit-status", role: "status", "data-status": "" });
  const controls = h("p", { class: "snake-pit-help", id: `snake-pit-controls-${id}` }, "Arrows / WASD or tap the arrows. Space pauses. No reversing.");
  const svg = s("svg", { viewBox: `0 0 ${state.maze.rows[0].length} ${state.maze.rows.length}`, role: "img", "aria-label": "Rocky burrow: one egg at a time and the exit at the top left" });
  const board = h("div", { class: "snake-pit-board", tabindex: 0, role: "group", "data-board": "", "aria-label": "Snake Pit play area", "aria-describedby": controls.id }, svg);
  const floor = s("g", { class: "snake-pit-floor" });
  state.maze.rows.forEach((row, y) => [...row].forEach((cell, x) => {
    if (cell === ".") floor.append(s("rect", { x, y, width: 1, height: 1 }));
  }));
  const exit = s("g", { class: "snake-pit-exit" },
    s("rect", { x: state.maze.exit.x + 0.08, y: state.maze.exit.y + 0.08, width: 0.84, height: 0.84, rx: 0.15 }),
    s("path", { d: "M0 -.28v.46m-.2-.2.2.2.2-.2", transform: `translate(${state.maze.exit.x + 0.5} ${state.maze.exit.y + 0.5})` }),
  );
  const eggLayer = s("g", { class: "snake-pit-eggs" });
  const bodyPath = s("polyline", { class: "snake-pit-body" });
  const tail = s("circle", { r: 0.24, class: "snake-pit-tail" });
  const headShape = s("g", {},
    s("rect", { x: -0.41, y: -0.39, width: 0.82, height: 0.78, rx: 0.26, class: "snake-pit-head" }),
    s("circle", { cx: 0.15, cy: -0.17, r: 0.075, class: "snake-pit-eye" }),
    s("circle", { cx: 0.15, cy: 0.17, r: 0.075, class: "snake-pit-eye" }),
  );
  const snake = s("g", { class: "snake-pit-snake" }, bodyPath, tail, headShape);
  // Keep the next nest visible even when a long tail is still passing over it.
  svg.append(floor, exit, snake, eggLayer);

  const buttons = new Map<Direction, HTMLButtonElement>();
  const dpad = h("div", { class: "snake-pit-dpad", role: "group", "aria-label": "Direction controls" });
  for (const direction of ["up", "left", "down", "right"] as const) {
    const button = h("button", { type: "button", class: "snake-pit-turn", "data-direction": direction, "aria-label": `Turn ${direction}` }, ARROWS[direction]);
    buttons.set(direction, button);
    dpad.append(button);
    button.addEventListener("click", () => queueTurn(direction), options);
  }
  const reflection = h("section", { class: "snake-pit-reflect", "data-reflect": "", hidden: true },
    h("h4", {}, "Then try the other setting"),
    h("p", {}, "What did you feel? Did changing growth change your route, your decisions, or how escaping felt?"),
  );
  const root = h("div", { class: "snake-pit", "data-phase": "ready" },
    h("div", { class: "snake-pit-hud" }, stat("Eggs", eggs), stat("Length", length), stat("Moving time", time)),
    h("div", { class: "snake-pit-settings" },
      h("label", { class: "snake-pit-growth" }, growth, mode),
      h("span", { class: "snake-pit-setting-note" }, `+${SEGMENTS_PER_EGG} segments per egg · set before starting`)),
    board,
    h("div", { class: "snake-pit-legend", "aria-hidden": "true" },
      h("span", {}, "● Snake"), h("span", {}, "⬭ Next egg"), h("span", {}, `⇩ Exit · opens at ${goal} eggs`)),
    status,
    h("div", { class: "snake-pit-play-controls" }, dpad, h("div", { class: "snake-pit-actions" }, action, restart)),
    controls, reflection,
  );
  el.append(root);

  function stopClock(): void {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
  }

  function draw(): void {
    const to = movement?.to ?? state;
    const progress = movement && !motion?.matches ? Math.min(1, movement.elapsed / MOVE_MS) : 0;
    const points = to.body.map((cell, i) => {
      const from = state.body[i] ?? state.body[state.body.length - 1];
      return { x: from.x + (cell.x - from.x) * progress + 0.5, y: from.y + (cell.y - from.y) * progress + 0.5 };
    });
    const head = points[0];
    // Follow the old cell centers around bends; a direct line between moving
    // segments would draw a diagonal through the corner of a wall.
    const path = points.flatMap((point, i) => {
      if (!movement || progress === 0 || i === points.length - 1) return [point];
      const joint = state.body[i] ?? state.body[state.body.length - 1];
      return [point, { x: joint.x + 0.5, y: joint.y + 0.5 }];
    });
    bodyPath.setAttribute("points", path.map((point) => `${point.x},${point.y}`).join(" "));
    tail.setAttribute("cx", String(points[points.length - 1].x));
    tail.setAttribute("cy", String(points[points.length - 1].y));
    headShape.setAttribute("transform", `translate(${head.x} ${head.y}) rotate(${ROTATION[to.direction]})`);
    time.textContent = clock(state.steps * MOVE_MS + (movement?.elapsed ?? 0));
  }

  function render(): void {
    const ended = state.phase === "won" || state.phase === "lost";
    root.setAttribute("data-phase", paused ? "paused" : state.phase);
    board.setAttribute("data-steps", String(state.steps));
    eggs.textContent = `${goal - state.eggs.length} / ${goal}`;
    length.textContent = state.growthPending ? `${state.body.length} +${state.growthPending}` : String(state.body.length);
    mode.textContent = `Growth ${growth.checked ? "ON" : "OFF"}`;
    growth.disabled = state.phase === "playing";
    restart.disabled = state.phase === "ready";
    action.textContent = paused ? "Resume" : state.phase === "playing" ? "Pause" : ended ? "Try again" : "Start escape";
    reflection.hidden = !ended;
    const open = state.eggs.length === 0;
    exit.setAttribute("data-open", String(open));
    svg.setAttribute("aria-label", `Rocky burrow. ${goal - state.eggs.length} of ${goal} eggs collected. Exit at top left ${open ? "open" : "locked"}. Snake length ${state.body.length}.`);
    const egg = state.eggs[0];
    eggLayer.replaceChildren(...(egg ? [
      s("circle", { cx: egg.x + 0.5, cy: egg.y + 0.5, r: 0.6, class: "snake-pit-egg-ring" }),
      s("ellipse", { cx: egg.x + 0.5, cy: egg.y + 0.5, rx: 0.31, ry: 0.42 }),
    ] : []));
    for (const [direction, button] of buttons) {
      button.disabled = state.phase !== "playing" || paused;
      button.setAttribute("data-queued", String(queued === direction));
    }
    let message = `Collect ${goal} eggs, one at a time. Then return to the exit at the top left.`;
    if (paused) message = "Paused. Resume when you’re ready.";
    else if (state.phase === "won") message = `Escaped in ${clock(state.steps * MOVE_MS)} with growth ${state.growth ? "ON" : "OFF"}. All ${goal} eggs are safe.`;
    else if (state.phase === "lost") message = state.collision === "wall" ? "Hit a wall. Try a different turn, or restart your route." : "Caught in your own body. Try a wider loop.";
    else if (state.phase === "playing") message = open
      ? `All ${goal} eggs! Reach the exit at the top left.`
      : state.growthPending ? "Growing! Leave a wide route around your own body."
        : `${state.eggs.length} ${state.eggs.length === 1 ? "egg" : "eggs"} to go. Leave room for your tail.`;
    if (status.textContent !== message) status.textContent = message;
    draw();
  }

  function queueTurn(direction: Direction): void {
    const heading = movement?.to.direction ?? state.direction;
    if (state.phase !== "playing" || paused || queued || heading === direction || !canTurn(heading, direction)) return;
    queued = direction;
    buttons.get(direction)!.setAttribute("data-queued", "true");
  }

  function beginMovement(now: number): Movement | null {
    const next = advance(state, queued ?? state.direction);
    queued = null;
    if (next.phase === "lost") {
      state = next;
      movement = null;
    } else {
      movement = { to: next, startedAt: now, elapsed: 0 };
    }
    render();
    return movement;
  }

  function schedule(): void {
    if (!disposed && !paused && state.phase === "playing" && frameId === null) frameId = requestAnimationFrame(frame);
  }

  function frame(now: number): void {
    frameId = null;
    if (disposed || paused || state.phase !== "playing" || !movement) return;
    const elapsed = now - movement.startedAt;
    // A suspended tab must never race through a backlog of unseen moves.
    if (elapsed > MOVE_MS * 2) { pause(); return; }
    movement.elapsed = Math.min(elapsed, MOVE_MS);
    if (elapsed >= MOVE_MS) {
      const boundary = movement.startedAt + MOVE_MS;
      state = movement.to;
      movement = null;
      if (state.phase === "playing") {
        const next = beginMovement(boundary);
        if (next) next.elapsed = now - boundary;
      } else render();
    }
    draw();
    schedule();
  }

  function pause(): void {
    if (state.phase !== "playing" || paused) return;
    paused = true;
    stopClock();
    render();
  }

  function primaryAction(): void {
    if (disposed) return;
    if (state.phase === "playing") {
      if (paused) {
        paused = false;
        if (movement) movement.startedAt = performance.now() - movement.elapsed;
        render();
        schedule();
      } else pause();
    } else {
      state = startGame(newGame(growth.checked));
      paused = false;
      queued = null;
      beginMovement(performance.now());
      schedule();
    }
    board.focus({ preventScroll: true });
  }

  action.addEventListener("click", primaryAction, options);
  restart.addEventListener("click", () => {
    stopClock();
    state = newGame(growth.checked);
    movement = null;
    queued = null;
    paused = false;
    render();
  }, options);
  growth.addEventListener("change", () => {
    if (state.phase === "ready") state = newGame(growth.checked);
    render();
  }, options);
  root.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target !== board && !(target instanceof Element && target.closest("[data-direction]"))) return;
    const direction = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
    if (!direction && event.code !== "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    if (event.code === "Space") primaryAction();
    else if (direction) queueTurn(direction);
  }, options);
  window.addEventListener("blur", pause, options);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); }, options);
  render();

  return () => {
    disposed = true;
    stopClock();
    events.abort();
    root.remove();
  };
}

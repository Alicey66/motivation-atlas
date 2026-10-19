import { h } from "../../lib/dom";
import type { Minigame } from "../types";
import platformerHtml from "./platformer/index.html?raw";
import platformerCss from "./platformer/styles.css?raw";
import platformerGame from "./platformer/game.js?raw";
import "./golden-sprint.css";

const ASSETS: Record<string, string> = {
  "assets/plot.jpg": new URL("./AI assets/plot.jpg", import.meta.url).href,
  "assets/generated/cinematic-scenes.png": new URL("./AI assets/cinematic-scenes.png", import.meta.url).href,
  "assets/generated/dionysus.png": new URL("./AI assets/dionysus.png", import.meta.url).href,
  "assets/generated/harpy-flight-v2.png": new URL("./AI assets/harpy-flight-v2.png", import.meta.url).href,
  "assets/generated/marigold-statue.png": new URL("./AI assets/marigold-statue.png", import.meta.url).href,
  "assets/generated/midas-sprites.png": new URL("./AI assets/midas-sprites.png", import.meta.url).href,
  "assets/generated/satyr-run-v4.png": new URL("./AI assets/satyr-run-v4.png", import.meta.url).href,
  "assets/generated/wine-sprites-v2.png": new URL("./AI assets/wine-sprites-v2.png", import.meta.url).href,
};

function replaceAssets(source: string): string {
  let result = source;
  for (const [relative, bundled] of Object.entries(ASSETS)) result = result.replaceAll(relative, bundled);
  return result;
}

function platformerDocument(): string {
  const css = replaceAssets(platformerCss) + `
    label:has(#hp-toggle), label:has(#pause-hp-toggle),
    label:has(#sfx-toggle), label:has(#pause-sfx-toggle) { display: none !important; }
    html, body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  `;
  const script = replaceAssets(platformerGame).replaceAll("</script", "<\\/script");
  return platformerHtml
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<script\s+src="game\.js"><\/script>/i, "")
    .replace("</head>", `<style>${css}</style></head>`)
    .replace("</body>", `<script>${script}</script></body>`);
}

function mount(el: HTMLElement): () => void {
  const hunger = h("input", { type: "checkbox", checked: true, "data-mechanic": "hunger-drain" });
  const frame = h("iframe", {
    class: "golden-port-frame",
    title: "Golden Sprint platform game",
    allow: "autoplay; fullscreen",
  });
  const expand = h("button", { type: "button", class: "golden-port-expand" }, "⛶ Expand game");
  const root = h("div", { class: "golden-port" },
    h("fieldset", { class: "golden-port-mechanic" },
      h("legend", {}, "Mechanic to compare"),
      h("label", {}, hunger, h("span", {}, " Hunger drains over time")),
      h("p", {}, "Change this setting, then begin or restart a run. Enemy and hazard damage remain active."),
    ),
    h("div", { class: "golden-port-toolbar" }, expand),
    frame,
    h("p", { class: "golden-port-focus" }, "Click or tap inside the game before using keyboard controls."),
  );
  el.append(root);

  function updateExpandLabel(): void {
    expand.textContent = document.fullscreenElement === root ? "× Exit expanded view" : "⛶ Expand game";
  }

  async function toggleExpand(): Promise<void> {
    if (document.fullscreenElement === root) await document.exitFullscreen();
    else await root.requestFullscreen();
  }

  expand.addEventListener("click", toggleExpand);
  document.addEventListener("fullscreenchange", updateExpandLabel);

  function syncSettings(): void {
    const doc = frame.contentDocument;
    const view = frame.contentWindow;
    if (!doc || !view) return;
    const hp = doc.querySelector<HTMLInputElement>("#hp-toggle");
    const pauseHp = doc.querySelector<HTMLInputElement>("#pause-hp-toggle");
    if (hp) {
      hp.checked = hunger.checked;
      const change = doc.createEvent("Event");
      change.initEvent("change", true, false);
      hp.dispatchEvent(change);
    }
    if (pauseHp) pauseHp.checked = hunger.checked;
    for (const id of ["#sfx-toggle", "#pause-sfx-toggle"]) {
      const sound = doc.querySelector<HTMLInputElement>(id);
      if (sound) sound.checked = true;
    }
  }

  frame.addEventListener("load", syncSettings);
  hunger.addEventListener("change", syncSettings);
  frame.srcdoc = platformerDocument();

  return () => {
    expand.removeEventListener("click", toggleExpand);
    document.removeEventListener("fullscreenchange", updateExpandLabel);
    if (document.fullscreenElement === root) void document.exitFullscreen();
    frame.src = "about:blank";
    root.remove();
  };
}

export const goldenSprint: Minigame = {
  slug: "golden-sprint",
  title: "Golden Sprint",
  motivators: ["challenge"],
  author: "JoshitaReddy",
  mount,
};

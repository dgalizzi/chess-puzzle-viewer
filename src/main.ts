import PuzzleViewer from "./puzzleViewer";
import view from "./view/main";
import {
  init,
  attributesModule,
  classModule,
  styleModule,
  eventListenersModule,
} from "snabbdom";

export default function start(element: HTMLElement): PuzzleViewer {
  const patch = init([
    classModule,
    attributesModule,
    styleModule,
    eventListenersModule,
  ]);

  const ctrl = new PuzzleViewer(
    "5r2/2R2P1k/7p/4q3/7K/8/6Q1/8 w - - 0 1",
    redraw,
  );
  const blueprint = view(ctrl);
  element.innerHTML = "";
  let vnode = patch(element, blueprint);

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  return ctrl;
}

start(document.getElementById("app") as HTMLElement);

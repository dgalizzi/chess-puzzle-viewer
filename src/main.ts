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
    "rn1qkbnr/pP2pppp/2b5/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 5",
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

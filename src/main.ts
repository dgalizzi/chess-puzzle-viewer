import PuzzleViewer from "./puzzleViewer";
import view from "./view/main";
import {
  init,
  attributesModule,
  classModule,
  styleModule,
  eventListenersModule,
} from "snabbdom";

export default function start(element: HTMLElement, pgn: string): PuzzleViewer {
  const patch = init([
    classModule,
    attributesModule,
    styleModule,
    eventListenersModule,
  ]);

  const ctrl = new PuzzleViewer(pgn, redraw);
  const blueprint = view(ctrl);
  element.innerHTML = "";
  let vnode = patch(element, blueprint);

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  return ctrl;
}

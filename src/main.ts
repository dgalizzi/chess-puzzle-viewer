import PuzzleViewer from "./puzzleViewer";
import view from "./view/main";
import {
  init,
  attributesModule,
  classModule,
  styleModule,
  eventListenersModule,
} from "snabbdom";

export default function start(
  element: HTMLElement,
  pgn: string,
  isFirstMoveBlunder: boolean = false,
): PuzzleViewer {
  const patch = init([
    classModule,
    attributesModule,
    styleModule,
    eventListenersModule,
  ]);

  const ctrl = new PuzzleViewer(pgn, isFirstMoveBlunder, redraw);
  const blueprint = view(ctrl);
  element.innerHTML = "";
  let vnode = patch(element, blueprint);

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  return ctrl;
}

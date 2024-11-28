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

  const ctrl = new PuzzleViewer(redraw);
  const blueprint = view(ctrl);
  element.innerHTML = "";
  let vnode = patch(element, blueprint);
  ctrl.div = vnode.elm as HTMLElement;

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  return ctrl;
}

start(document.getElementById("app") as HTMLElement);

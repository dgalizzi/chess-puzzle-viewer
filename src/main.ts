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

start(
  document.getElementById("puzzle1") as HTMLElement,
  '[FEN "5r2/2R2P1k/7p/4q3/7K/8/6Q1/8 w - - 0 1"]\n\n1. Qg8+ Rxg8 2. f8=N+ Kh8 3. Rh7#',
);
start(
  document.getElementById("puzzle2") as HTMLElement,
  '[FEN "8/8/2pqp3/2Q2pkp/3P2p1/4P1P1/4KPP1/8 b - - 3 43"]\n\n Qxc5 dxc5 Kf6 f4 gxf3+ Kxf3 Ke5 e4',
);

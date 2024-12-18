import ChessPuzzleViewer from "./main.ts";

ChessPuzzleViewer(
  document.getElementById("puzzle1") as HTMLElement,
  '[FEN "5r2/2R2P1k/7p/4q3/7K/8/6Q1/8 w - - 0 1"]\n\n1. Qg8+ Rxg8 2. f8=N+ Kh8 3. Rh7#',
);

ChessPuzzleViewer(
  document.getElementById("puzzle2") as HTMLElement,
  '[FEN "8/8/2pqp3/2Q2pkp/3P2p1/4P1P1/4KPP1/8 b - - 3 43"]\n\n Qxc5 dxc5 Kf6 f4 gxf3+ Kxf3 Ke5 e4',
);

ChessPuzzleViewer(
  document.getElementById("puzzle3") as HTMLElement,
  `[FEN "8/P6R/6p1/8/6k1/8/r6P/7K w - - 3 46"]

h3+ Kg3 a8=R Rxa8 Rf7 Ra1+ Rf1 Rxf1#`,
  true,
);

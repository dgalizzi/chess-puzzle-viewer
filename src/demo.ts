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
  `
[Event "WR Chess Masters 2024"]
[Site "London ENG"]
[Date "2024.10.16"]
[Round "3.3"]
[White "Firouzja,Alireza"]
[Black "Vachier Lagrave,M"]
[Result "0-1"]
[BlackElo "2735"]
[BlackFideId "623539"]
[BlackTitle "GM"]
[ECO "B90"]
[EventDate "2024.10.14"]
[EventType "k.o."]
[FEN "6k1/5p2/B5p1/7n/3N3P/1PP1p3/PK3p2/5Rr1 w - - 1 37"]
[Opening "Sicilian"]
[PuzzleEngine "Stockfish 17"]
[PuzzleMakerVersion "0.5"]
[PuzzleWinner "Black"]
[SetUp "1"]
[Source "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. f3 e5 7. Nb3 Be6 8. Be3 h5 9. Nd5 Bxd5 10. exd5 Nbd7 11. Qd2 g6 12. O-O-O Nb6 13. Kb1 Nbxd5 14. Bg5 Be7 15. Bd3 Qc7 16. Rhe1 O-O 17. h4 Nb6 18. g4 d5 19. Qh2 Rae8 20. Qxe5 Qxe5 21. Rxe5 Bd8 22. Rxe8 Rxe8 23. Nc5 hxg4 24. Nxb7 gxf3 25. Nxd8 Ne4 26. Nc6 f2 27. Kc1 Ng3 28. b3 Re1 29. Bf4 Nf5 30. Bd2 Rg1 31. Rf1 d4 32. Kb2 Ne3 33. Bxe3 dxe3 34. Bxa6 Nd5 35. Nd4 Nf4 36. c3 Nh5 37. b4 Ng3 38. Rc1 Rxc1"]
[Variation "Najdorf"]
[WhiteElo "2767"]
[WhiteFideId "12573981"]
[WhiteTitle "GM"]

37. b4 Ng3 38. Rxf2 exf2 39. a4 0-1
`,
  true,
);

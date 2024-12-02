# Chess Puzzle Viewer (WIP)

Inspired by [lichess-org/pgn-viewer](https://github.com/lichess-org/pgn-viewer/), **Chess Puzzle Viewer** is a widget for viewing and interacting with chess puzzles.

The viewer uses the following libraries:

- [chessground](https://github.com/lichess-org/chessground) for rendering the board and pieces.
- [chessops](https://github.com/niklasf/chessops) for handling chess logic (generating legal chess moves, pgn and fen parsing).

Also special thanks to:

- [chessground-promotion](https://github.com/hi-ogawa/chessground-promotion) from where I borrowed key ideas for pawn promotion dialog implementation.

Built with [Vite](https://vite.dev/).

---

## Features

- **Interactive Board**: Users can play moves directly on the board, with validation for legal moves.
- **Standard Rules Support**: Includes pawn promotion (including under promotion) and en passant capture.
- **Load Puzzle from PGN**: Initialize the board state from a PGN-formatted puzzle.
- **Move Validation Against PGN**: Reject incorrect user moves if they deviate from the puzzle solution.
- **Opponent moves**: Once the player makes the correct move, the opponent's move is made automatically.

---

## Planned

- Configuration: So far nothing is configurable except the PGN. There should be at least access to Chessground configuration
  and move speed and wait times for opponent moves.
- Puzzles where the first move is the blunder: Some puzzles PGNs include the blunder that starts the puzzle.
  There should be an option to set this, then the first move should execute automatically. Also in this case the orientation
  of the board comes from the position after the first move.
- Include full game in PGN: There should be support for having an extra special header in the PGN
  with the full mainline of the original game. This allow some nice features like having an analysis link
  that takes you to lichess with the full game in analysis board.
- Custom CSS: Example showing a different board theme and pieces.

---

## Non Goals

- Engine Support
- Variations Support

---

## Usage

### As an NPM package

```
npm i chess-puzzle-viewer
```

#### Requirements

- The PGN must have the FEN header
- The puzzle must start with the player's move

```js
import ChessPuzzleViewer from "chess-puzzle-viewer";

ChessPuzzleViewer(
  document.getElementById("puzzle"),
  '[FEN "5r2/2R2P1k/7p/4q3/7K/8/6Q1/8 w - - 0 1"]\n\n1. Qg8+ Rxg8 2. f8=N+ Kh8 3. Rh7#',
);
```

#### Style

- You can get the CSS from `node_modules/chess-puzzle-viewer/dist/chess-puzzle-viewer.css`

### Demo

To start a local development environment with a demo, run:

```bash
npm run dev
```

Check `index.html`, `src/demo.ts` and `assets/demo.css` files for the demo example.

---

## Acknowledgements

This project would not have been possible without the work of:

- [lichess-org/pgn-viewer](https://github.com/lichess-org/pgn-viewer)
- [chessground](https://github.com/lichess-org/chessground)
- [chessops](https://github.com/niklasf/chessops)
- [chessground-promotion](https://github.com/hi-ogawa/chessground-promotion)
- [lila](https://github.com/lichess-org/lila)

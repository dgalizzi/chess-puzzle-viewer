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

- NPM package: There should be an NPM package to import the widget.
- Configuration: So far nothing is configurable except the PGN. There should be at least access to Chessground configuration
  and move speed and wait times for opponent moves.
- Puzzles where the first move is the blunder: Some puzzles PGNs include the blunder that starts the puzzle.
  There should be an option to set this, then the first move should execute automatically. Also in this case the orientation
  of the board comes from the position after the first move.
- Custom CSS: Example showing a different board theme and pieces.
- Include full game in PGN: There should be support for having an extra special header in the PGN
  with the full mainline of the original game. This allow some nice features like having an analysis link
  that takes you to lichess with the full game in analysis board.

---

## Non Goals

- Engine Support
- Variations Support

---

## Usage

### Development Server

To start a local development environment with a demo, run:

```bash
npm run dev
```

### As an NPM package

(not yet)

---

## Acknowledgements

This project would not have been possible without the work of:

- [lichess-org/pgn-viewer](https://github.com/lichess-org/pgn-viewer)
- [chessground](https://github.com/lichess-org/chessground)
- [chessops](https://github.com/niklasf/chessops)
- [chessground-promotion](https://github.com/hi-ogawa/chessground-promotion)
- [lila](https://github.com/lichess-org/lila)

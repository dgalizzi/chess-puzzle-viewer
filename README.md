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

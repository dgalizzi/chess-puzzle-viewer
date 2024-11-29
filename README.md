# Chess Puzzle Viewer (WIP)

Inspired by [lichess-org/pgn-viewer](https://github.com/lichess-org/pgn-viewer/), **Chess Puzzle Viewer** is a widget for viewing and interacting with chess puzzles.

The viewer leverages the following libraries:

- [chessground](https://github.com/lichess-org/chessground) for rendering the board and pieces.
- [chessops](https://github.com/niklasf/chessops) for generating legal chess moves.

Also special thanks to:

- [chessground-promotion](https://github.com/hi-ogawa/chessground-promotion) from where I borrowed pawn promotion dialog implementation.

Built with [Vite](https://vite.dev/).

---

## Features

- **Interactive Board**: Users can play moves directly on the board, with validation for legal moves.
- **Special Rules Support**: Includes pawn promotion and en passant capture.

---

## Planned Features

1. **Load Puzzle from PGN**: Initialize the board state from a PGN-formatted puzzle.
2. **Move Validation Against PGN**: Reject incorrect user moves if they deviate from the puzzle solution.
3. **Opponent moves**: Once the player makes the correct move, the opponent's move should be made automatically.

---

## Usage

### Development Server

To start a local development environment, run:

```bash
npm run dev
```

---

## Acknowledgements

This project would not have been possible without the work of:

- [lichess-org/pgn-viewer](https://github.com/lichess-org/pgn-viewer)
- [chessground](https://github.com/lichess-org/chessground)
- [chessops](https://github.com/niklasf/chessops)
- [chessground-promotion](https://github.com/hi-ogawa/chessground-promotion)
- [lila](https://github.com/lichess-org/lila)

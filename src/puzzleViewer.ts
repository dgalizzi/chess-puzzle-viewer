import { Api as CgApi } from "chessground/api";
import { Chess } from "chessops/chess";
import { Config } from "chessground/config";
import { makeFen, parseFen } from "chessops/fen";
import { chessgroundDests, chessgroundMove } from "chessops/compat";
import {
  defaultSetup,
  Move,
  NormalMove,
  opposite,
  parseSquare,
  parseUci,
  Role,
} from "chessops";
import { Key, Piece } from "chessground/types";
import { PromotionHandler } from "./promotionHandler";
import { Game, parsePgn, PgnNodeData, startingPosition } from "chessops/pgn";
import { parseSan } from "chessops/san";

export default class PuzzleViewer {
  private ground?: CgApi;
  private pos: Chess;
  private promotionHandler: PromotionHandler;
  private puzzleMainMoves: NormalMove[];
  private currentPuzzleMove: number = 0;
  private initialColorToPlay: "white" | "black";
  private firstAutoMove: boolean = false;

  constructor(
    pgn: string,
    readonly isFirstMoveBlunder: boolean,
    readonly redraw: () => void,
  ) {
    this.promotionHandler = new PromotionHandler(redraw);

    const game = this.getGameFromPgn(pgn);
    this.puzzleMainMoves = this.getPuzzleMoves(game);
    this.pos = this.getInitialPosition(game);
    this.initialColorToPlay = isFirstMoveBlunder
      ? opposite(this.pos.turn)
      : this.pos.turn;

    this.firstAutoMove = isFirstMoveBlunder;
  }

  public setGround(cg: CgApi) {
    this.ground = cg;
    this.setBoardToPosition(true);

    if (this.firstAutoMove) {
      this.firstAutoMove = false;
      setTimeout(() => {
        this.makeOpponentMove();
      }, 400);
    }
  }

  public cgState(): Config {
    return {
      orientation: this.initialColorToPlay,
      movable: {
        free: false,
        events: {
          after: (orig, dest, _) => this.handleMove(orig, dest),
        },
      },
    };
  }

  public isPromotionPromptOpened(): boolean {
    return this.promotionHandler.isOpen();
  }

  public resolvePromotion(r: Role) {
    if (this.isPromotionPromptOpened()) {
      const move = {
        from: parseSquare(this.promotionHandler.promotion!.orig)!,
        to: parseSquare(this.promotionHandler.promotion!.dest)!,
        promotion: r,
      };

      if (!this.isPuzzleMove(move)) {
        this.handleBlunderMove(this.promotionHandler.promotion!.dest);
      } else {
        this.makeMove(move);
        this.currentPuzzleMove++;
        this.makeOpponentMove();
      }

      return this.promotionHandler.promotion!.resolve(r);
    } else {
      throw new Error(
        "Trying to resolve promotion when promotion prompt is not opened",
      );
    }
  }

  public cancelPromotion() {
    if (this.isPromotionPromptOpened()) {
      return this.promotionHandler.promotion!.resolve(null);
    }

    throw new Error(
      "Trying to resolve promotion when promotion prompt is not opened",
    );
  }

  public getPromotionDest(): string {
    if (this.isPromotionPromptOpened()) {
      return this.promotionHandler.promotion!.dest;
    }

    throw new Error(
      "Trying to get promotion dest when promotion prompt is not opened",
    );
  }

  public getPromotionColor(): string {
    if (this.isPromotionPromptOpened()) {
      return this.promotionHandler.promotion!.color;
    }

    throw new Error(
      "Trying to get promotion color when promotion prompt is not opened",
    );
  }

  private getGameFromPgn(pgn: string) {
    const games = parsePgn(pgn);
    if (games.length > 1) {
      throw new Error("Only PGNs with a single game are supported");
    }
    const game = games[0];
    return game;
  }

  private getPuzzleMoves(game: Game<PgnNodeData>) {
    const pos = startingPosition(game.headers).unwrap();
    let puzzleMainMoves: NormalMove[] = [];

    for (const node of game.moves.mainline()) {
      const move = parseSan(pos, node.san);
      if (!move) {
        throw new Error(`Invalid move in pgn: ${node.san}`);
      }
      pos.play(move);
      puzzleMainMoves.push(move as NormalMove);
    }

    return puzzleMainMoves;
  }

  private getInitialPosition(game: Game<PgnNodeData>): Chess {
    const fen = game.headers.get("FEN");
    let pos: Chess;
    if (!fen) {
      pos = Chess.fromSetup(defaultSetup()).unwrap();
    } else {
      const setup = parseFen(fen).unwrap();
      pos = Chess.fromSetup(setup).unwrap();
    }
    return pos;
  }

  private isPuzzleMove(move: NormalMove) {
    const nextPuzzleMove = this.puzzleMainMoves[this.currentPuzzleMove];
    const isPuzzleMove =
      move.from == nextPuzzleMove.from &&
      move.to == nextPuzzleMove.to &&
      move.promotion == nextPuzzleMove.promotion;

    return isPuzzleMove;
  }

  private makeOpponentMove() {
    // -1 because the puzzle might (incorrectly?) end with an
    // opponent move, but we want the last move to be always the
    // player move.
    // So if at this point there is only a single move left,
    // we skip it and end the puzzle.
    if (this.currentPuzzleMove >= this.puzzleMainMoves.length - 1) {
      this.endPuzzle();
      return;
    }

    setTimeout(() => {
      const puzzleMove = this.puzzleMainMoves[this.currentPuzzleMove];
      const opponentsMove = chessgroundMove(puzzleMove);
      this.ground?.move(opponentsMove[0], opponentsMove[1]);
      this.handleMove(
        opponentsMove[0],
        opponentsMove[1],
        true,
        puzzleMove.promotion,
      );
      this.currentPuzzleMove++;
      if (this.currentPuzzleMove >= this.puzzleMainMoves.length) {
        this.endPuzzle();
      }
    }, 300);
  }

  private handleMove(
    orig: Key,
    dest: Key,
    autoMove = false,
    promotion?: Role,
  ): void {
    const uciMove = `${orig}${dest}`;
    const move = parseUci(uciMove) as NormalMove;
    if (!move) return;

    const piece = this.ground!.state.pieces.get(dest);
    if (!piece) return;

    if (this.promotionHandler.isPromotion(dest, piece)) {
      if (autoMove) {
        this.promotionHandler.applyPromotion(
          dest,
          piece,
          promotion!,
          move,
          this.ground!,
        );
      } else {
        this.openPromotionPrompt(dest, orig, piece, move);
        return;
      }
    }

    this.handleEnPassant(orig, dest);

    if (!autoMove) {
      if (this.currentPuzzleMove >= this.puzzleMainMoves.length) {
        return;
      }
      if (this.isPuzzleMove(move)) {
        this.makeMove(move, autoMove);
        this.currentPuzzleMove++;
        this.makeOpponentMove();
      } else {
        this.handleBlunderMove(dest);
      }
    } else {
      this.makeMove(move, autoMove);
    }
  }

  private handleBlunderMove(square: Key) {
    this.ground?.setAutoShapes([
      {
        orig: square,
        customSvg: { html: glyphToSvg["✗"] },
      },
    ]);
    setTimeout(() => {
      this.setBoardToPosition(true);
    }, 300);
  }

  private async openPromotionPrompt(
    dest: Key,
    orig: Key,
    piece: Piece,
    move: Move,
  ): Promise<void> {
    const role = await this.promotionHandler.open(dest, orig, piece.color);
    if (role) {
      this.promotionHandler.applyPromotion(
        dest,
        piece,
        role,
        move,
        this.ground!,
      );
    } else {
      this.setBoardToPosition();
    }
  }

  private handleEnPassant(orig: Key, dest: Key): void {
    const enPassantSquareCapture = this.getEnPassantCaptureSquare(
      orig,
      dest,
      (s: string) => this.pos.board.get(parseSquare(s)!),
    );

    if (enPassantSquareCapture) {
      this.ground!.setPieces(
        new Map([[enPassantSquareCapture as Key, undefined]]),
      );
    }
  }

  private getEnPassantCaptureSquare(
    orig: string,
    dest: string,
    getPieceInSquare: (square: string) => Piece | undefined,
  ): string | undefined {
    const piece = getPieceInSquare(orig);

    if (!piece || piece.role !== "pawn") return undefined;

    const origFile = orig.charCodeAt(0);
    const destFile = dest.charCodeAt(0);

    if (Math.abs(origFile - destFile) === 1 && !getPieceInSquare(dest)) {
      const destRank = parseInt(dest[1]);
      const capturedRank =
        piece.color === "white" ? destRank - 1 : destRank + 1;
      return String.fromCharCode(destFile) + capturedRank;
    }

    return undefined;
  }

  private makeMove(move: NormalMove, autoMove: boolean = false): void {
    this.pos.play(move);
    this.updateLegalMoves();

    if (!autoMove) {
      this.ground?.setAutoShapes([
        {
          orig: chessgroundMove(move)[1],
          customSvg: { html: glyphToSvg["✓"] },
        },
      ]);
    } else {
      this.ground?.setAutoShapes([]);
    }
  }

  private setBoardToPosition(disableAnimation = false): void {
    if (disableAnimation) {
      this.ground!.set({ animation: { enabled: false } });
    }

    this.ground!.set({ fen: makeFen(this.pos.toSetup()) });
    this.updateLegalMoves();
    this.ground?.setAutoShapes([]);

    if (disableAnimation) {
      this.ground!.set({ animation: { enabled: true } });
    }
  }

  private updateLegalMoves(): void {
    if (!this.firstAutoMove) {
      this.ground!.set({ movable: { dests: chessgroundDests(this.pos) } });
    }
  }

  private endPuzzle() {
    this.ground!.set({ movable: { dests: undefined } });
  }
}

// Grabbed from https://github.com/lichess-org/lila
const prependDropShadow = (svgBase: string) =>
  `<defs><filter id="shadow"><feDropShadow dx="4" dy="7" stdDeviation="5" flood-opacity="0.5" /></filter></defs>
  <g transform="translate(60 0) scale(0.4)">${svgBase}</g>`;

const glyphToSvg = {
  // Correct move in a puzzle
  "✓": prependDropShadow(`
  <circle style="fill:#22ac38;filter:url(#shadow)" cx="50" cy="50" r="50" />
  <path fill="#fff" d="M87 32.8q0 2-1.4 3.2L51 70.6 44.6 77q-1.7 1.3-3.4 1.3-1.8 0-3.1-1.3L14.3 53.3Q13 52 13 50q0-2 1.3-3.2l6.4-6.5Q22.4 39 24 39q1.9 0 3.2 1.3l14 14L72.7 23q1.3-1.3 3.2-1.3 1.6 0 3.3 1.3l6.4 6.5q1.3 1.4 1.3 3.4z"/>
`),

  // Incorrect move in a puzzle
  "✗": prependDropShadow(`
  <circle style="fill:#df5353;filter:url(#shadow)" cx="50" cy="50" r="50" />
  <path fill="#fff" d="M79.4 68q0 1.8-1.4 3.2l-6.7 6.7q-1.4 1.4-3.5 1.4-1.9 0-3.3-1.4L50 63.4 35.5 78q-1.4 1.4-3.3 1.4-2 0-3.5-1.4L22 71.2q-1.4-1.4-1.4-3.3 0-1.7 1.4-3.5L36.5 50 22 35.4Q20.6 34 20.6 32q0-1.7 1.4-3.5l6.7-6.5q1.2-1.4 3.5-1.4 2 0 3.3 1.4L50 36.6 64.5 22q1.2-1.4 3.3-1.4 2.3 0 3.5 1.4l6.7 6.5q1.4 1.8 1.4 3.5 0 2-1.4 3.3L63.5 49.9 78 64.4q1.4 1.8 1.4 3.5z"/>
`),
};

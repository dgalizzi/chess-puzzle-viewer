import { Api as CgApi } from "chessground/api";
import { Chess } from "chessops/chess";
import { Config } from "chessground/config";
import { makeFen, parseFen } from "chessops/fen";
import { chessgroundDests, chessgroundMove } from "chessops/compat";
import {
  defaultSetup,
  Move,
  NormalMove,
  parseSquare,
  parseUci,
  Role,
} from "chessops";
import { Key, Piece } from "chessground/types";
import { PromotionHandler } from "./promotionHandler";

export default class PuzzleViewer {
  private ground?: CgApi;
  private pos: Chess;
  private promotionHandler: PromotionHandler;
  private puzzleMainMoves: NormalMove[];
  private currentPuzzleMove: number = 0;

  constructor(
    fen: string | undefined,
    readonly redraw: () => void,
  ) {
    this.promotionHandler = new PromotionHandler(redraw);

    this.puzzleMainMoves = [
      parseUci("g2g8") as NormalMove,
      parseUci("f8g8") as NormalMove,
      { ...(parseUci("f7f8") as NormalMove), promotion: "knight" },
      parseUci("h7h8") as NormalMove,
      parseUci("c7h7") as NormalMove,
    ];

    if (!fen) {
      this.pos = Chess.fromSetup(defaultSetup()).unwrap();
    } else {
      const setup = parseFen(fen).unwrap();
      this.pos = Chess.fromSetup(setup).unwrap();
    }
  }

  public setGround(cg: CgApi) {
    this.ground = cg;
    this.setBoardToPosition(true);
  }

  public cgState(): Config {
    return {
      movable: {
        free: false,
        dests: chessgroundDests(this.pos),
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
        this.makeOpponentMove();
      }

      return this.promotionHandler.promotion!.resolve(r);
    } else {
      throw new Error(
        "Trying to resolve promotion when promotion prompt is not opened",
      );
    }
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
    this.currentPuzzleMove++;
    if (this.currentPuzzleMove >= this.puzzleMainMoves.length) {
      return;
    }

    setTimeout(() => {
      const opponentsMove = chessgroundMove(
        this.puzzleMainMoves[this.currentPuzzleMove],
      );
      this.ground?.move(opponentsMove[0], opponentsMove[1]);
      this.handleMove(opponentsMove[0], opponentsMove[1], true);
      this.currentPuzzleMove++;
    }, 200);
  }

  private handleMove(orig: Key, dest: Key, autoMove = false): void {
    const uciMove = `${orig}${dest}`;
    const move = parseUci(uciMove) as NormalMove;
    if (!move) return;

    const piece = this.ground!.state.pieces.get(dest);
    if (!piece) return;

    if (this.promotionHandler.isPromotion(dest, piece)) {
      this.handlePromotion(dest, orig, piece, move);
      return;
    }

    this.handleEnPassant(orig, dest);

    if (!autoMove) {
      if (this.currentPuzzleMove >= this.puzzleMainMoves.length) {
        return;
      }
      if (this.isPuzzleMove(move)) {
        this.makeMove(move, autoMove);
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
      this.setBoardToPosition();
    }, 300);
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

  private async handlePromotion(
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
    this.ground!.set({ movable: { dests: chessgroundDests(this.pos) } });
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

import { Api as CgApi } from "chessground/api";
import { Chess } from "chessops/chess";
import { Config } from "chessground/config";
import { makeFen } from "chessops/fen";
import { chessgroundDests } from "chessops/compat";
import {
  Color,
  defaultSetup,
  Move,
  parseSquare,
  parseUci,
  Role,
} from "chessops";
import { Key, Piece } from "chessground/types";

export default class PuzzleViewer {
  ground?: CgApi;
  div?: HTMLElement;
  pos: Chess;
  promotion: { dest: any; color: any; resolve: any } | null;

  constructor(readonly redraw: () => void) {
    this.pos = Chess.fromSetup(defaultSetup()).unwrap();
    this.promotion = null;
  }

  public setGround(cg: CgApi) {
    this.ground = cg;
  }

  public cgState(): Config {
    const pv = this;
    return {
      movable: {
        free: false,
        dests: chessgroundDests(pv.pos),
        events: {
          after(orig, dest, _) {
            pv.handleMove(orig, dest);
          },
        },
      },
    };
  }

  private handleMove(orig: Key, dest: Key): void {
    const uciMove = `${orig}${dest}`;
    const move = parseUci(uciMove);
    if (!move) return;

    const piece = this.ground!.state.pieces.get(dest);
    if (!piece) return;

    if (this.isPromotion(dest, piece)) {
      this.handlePromotion(dest, piece, move);
      return;
    }

    this.handleEnPassant(orig, dest);
    this.makeMove(move);
  }

  private isPromotion(dest: Key, piece: Piece): boolean {
    return (
      piece.role == "pawn" &&
      ((piece.color == "white" && dest[1] == "8") ||
        (piece.color == "black" && dest[1] == "1"))
    );
  }

  private handlePromotion(dest: Key, piece: Piece, move: Move): void {
    this.promptPromotion(dest, piece.color).then((role: Role | undefined) => {
      if (role !== undefined) {
        this.applyPromotion(dest, piece, role, move);
      } else {
        this.resetToPreviousPosition();
      }
      this.updateLegalMoves();
    });
  }

  private async promptPromotion(
    dest: Key,
    color: Color,
  ): Promise<Role | undefined> {
    const role: Role | undefined = await new Promise((resolve) => {
      this.promotion = { dest, color, resolve };
      this.redraw();
    });
    this.promotion = null;
    this.redraw();
    return role;
  }

  private applyPromotion(
    dest: Key,
    piece: Piece,
    role: Role,
    move: Move,
  ): void {
    if ("promotion" in move) {
      move.promotion = role;
      piece.role = role;
      piece.promoted = true;
      this.ground!.setPieces(new Map([[dest, piece]]));
      this.pos.play(move);
    }
  }

  private resetToPreviousPosition(): void {
    this.ground!.set({ fen: makeFen(this.pos.toSetup()) });
  }

  private handleEnPassant(orig: string, dest: string): void {
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

    if (!piece || piece.role !== "pawn") {
      return undefined;
    }

    const origFile = orig.charCodeAt(0);
    const destFile = dest.charCodeAt(0);

    // Check if the move is diagonal
    if (Math.abs(origFile - destFile) === 1) {
      // Check if the destination square is empty (indicating en passant)
      if (getPieceInSquare(dest) === undefined) {
        const destRank = parseInt(dest[1]);
        const capturedRank =
          piece.color === "white" ? destRank - 1 : destRank + 1;
        const capturedSquare = String.fromCharCode(destFile) + capturedRank;
        return capturedSquare;
      }
    }

    return undefined; // Not an en passant capture
  }

  private makeMove(move: Move): void {
    this.pos.play(move);
    this.updateLegalMoves();
  }

  private updateLegalMoves(): void {
    this.ground!.set({ movable: { dests: chessgroundDests(this.pos) } });
  }
}

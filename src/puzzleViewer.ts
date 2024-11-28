import { Api as CgApi } from "chessground/api";
import { Chess } from "chessops/chess";
import { Config } from "chessground/config";
import { makeFen, parseFen } from "chessops/fen";
import { chessgroundDests } from "chessops/compat";
import { defaultSetup, Move, parseSquare, parseUci, Role } from "chessops";
import { Key, Piece } from "chessground/types";
import { PromotionHandler } from "./promotionHandler";

export default class PuzzleViewer {
  private ground?: CgApi;
  private pos: Chess;
  private promotionHandler: PromotionHandler;

  constructor(
    fen: string | undefined,
    readonly redraw: () => void,
  ) {
    this.promotionHandler = new PromotionHandler(redraw);

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

  private handleMove(orig: Key, dest: Key): void {
    const uciMove = `${orig}${dest}`;
    const move = parseUci(uciMove);
    if (!move) return;

    const piece = this.ground!.state.pieces.get(dest);
    if (!piece) return;

    if (this.promotionHandler.isPromotion(dest, piece)) {
      this.handlePromotion(dest, piece, move);
      return;
    }

    this.handleEnPassant(orig, dest);
    this.makeMove(move);
  }

  public isPromotionPromptOpened(): boolean {
    return this.promotionHandler.promotion !== null;
  }

  public resolvePromotion(r: Role) {
    if (this.isPromotionPromptOpened()) {
      return this.promotionHandler.promotion!.resolve(r);
    }

    throw new Error(
      "Trying to resolve promotion when promotion prompt is not opened",
    );
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
    piece: Piece,
    move: Move,
  ): Promise<void> {
    const role = await this.promotionHandler.promptPromotion(dest, piece.color);
    if (role) {
      this.promotionHandler.applyPromotion(
        dest,
        piece,
        role,
        move,
        this.ground!,
        this.pos,
      );
    } else {
      this.setBoardToPosition();
    }
    this.updateLegalMoves();
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

  private makeMove(move: Move): void {
    this.pos.play(move);
    this.updateLegalMoves();
  }

  private setBoardToPosition(disableAnimation = false): void {
    if (disableAnimation) {
      this.ground!.set({ animation: { enabled: false } });
    }

    this.ground!.set({ fen: makeFen(this.pos.toSetup()) });

    if (disableAnimation) {
      this.ground!.set({ animation: { enabled: true } });
    }
  }

  private updateLegalMoves(): void {
    this.ground!.set({ movable: { dests: chessgroundDests(this.pos) } });
  }
}

import { Color, Role, Move } from "chessops";
import { Key, Piece } from "chessground/types";
import { Chess } from "chessops/chess";
import { Api as CgApi } from "chessground/api";

export class PromotionHandler {
  private _promotion?: {
    dest: Key;
    color: Color;
    resolve: (value: Role | null) => void;
  };
  private _isPromotionOpen = false;

  constructor(private readonly redraw: () => void) {}

  public get promotion():
    | {
        dest: Key;
        color: Color;
        resolve: (value: Role | null) => void;
      }
    | undefined {
    return this._promotion;
  }

  public set promotion(
    value:
      | {
          dest: Key;
          color: Color;
          resolve: (value: Role | null) => void;
        }
      | undefined,
  ) {
    this._promotion = value;
  }

  public isOpen(): boolean {
    return this._isPromotionOpen;
  }

  public close() {
    this._isPromotionOpen = false;
  }

  public async open(dest: Key, color: Color): Promise<Role | null> {
    // Wait for user to pick promotion piece
    const role: Role | null = await new Promise((resolve) => {
      this.promotion = { dest, color, resolve };
      this._isPromotionOpen = true;
      this.redraw();
    });

    // Promotion ended
    this.close();
    this.promotion = undefined;
    this.redraw();
    return role;
  }

  public applyPromotion(
    dest: Key,
    piece: Piece,
    role: Role,
    move: Move,
    ground: CgApi,
    pos: Chess,
  ): void {
    if ("promotion" in move) {
      move.promotion = role;
      piece.role = role;
      piece.promoted = true;
      ground.setPieces(new Map([[dest, piece]]));
      pos.play(move);
    }
  }

  public isPromotion(dest: Key, piece: Piece): boolean {
    return (
      piece.role === "pawn" &&
      ((piece.color === "white" && dest[1] === "8") ||
        (piece.color === "black" && dest[1] === "1"))
    );
  }
}

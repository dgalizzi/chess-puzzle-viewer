import { Api as CgApi } from "chessground/api";
import { Chess } from "chessops/chess";
import { Config } from "chessground/config";
import { makeFen } from "chessops/fen";
import { chessgroundDests } from "chessops/compat";
import { Color, defaultSetup, parseSquare, parseUci, Role } from "chessops";
import { Key, Piece } from "chessground/types";

export default class PuzzleViewer {
  ground?: CgApi;
  div?: HTMLElement;
  pos: Chess;
  promotion: { dest: any; color: any; resolve: any } | null;

  constructor(readonly redraw: () => void) {
    // r1bqkbnr/pPn1pppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 5
    //
    // const setup = parseFen(
    //   "r1bqkbnr/pPn1pppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 1 5",
    // ).unwrap();
    // this.pos = Chess.fromSetup(setup).unwrap();

    this.pos = Chess.fromSetup(defaultSetup()).unwrap();
    this.promotion = null;
  }

  setGround(cg: CgApi) {
    this.ground = cg;
  }

  isPromotion(dest: Key, piece: Piece): boolean {
    return (
      piece.role == "pawn" &&
      ((piece.color == "white" && dest[1] == "8") ||
        (piece.color == "black" && dest[1] == "1"))
    );
  }

  async promptPromotion(dest: Key, color: Color): Promise<Role | undefined> {
    const role: Role | undefined = await new Promise((resolve) => {
      this.promotion = { dest, color, resolve };
      this.redraw();
    });
    this.promotion = null;
    this.redraw();
    return role;
  }

  getEnPassantCaptureSquare(
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

  cgState(): Config {
    const pv = this;
    return {
      movable: {
        free: false,
        dests: chessgroundDests(pv.pos),
        events: {
          after(orig, dest, metadata) {
            const uciMove = `${orig}${dest}`;
            const move = parseUci(uciMove);
            if (!move) return undefined;

            const piece = pv.ground!.state.pieces.get(dest);
            if (!piece) {
              return undefined;
            }

            // Handle promotion
            if (pv.isPromotion(dest, piece)) {
              if ("promotion" in move) {
                pv.promptPromotion(dest, piece.color).then(
                  (role: Role | undefined) => {
                    if (role !== undefined) {
                      move.promotion = role;
                      piece.role = role;
                      piece.promoted = true;
                      pv.ground!.setPieces(new Map([[dest, piece]]));
                      pv.pos.play(move);
                    } else {
                      // User clicked outside of any of the promotion pieces
                      // Set the previous position
                      pv.ground?.set({ fen: makeFen(pv.pos.toSetup()) });
                    }
                    pv.ground!.set(pv.cgState());
                    pv.promotion = null;
                  },
                );
                return undefined;
              }
            }

            // Handle en passant
            const enPassantSquareCapture = pv.getEnPassantCaptureSquare(
              orig,
              dest,
              (s: string) => pv.pos.board.get(parseSquare(s)!),
            );

            if (enPassantSquareCapture) {
              // Remove the captured piece
              pv.ground!.setPieces(
                new Map([[enPassantSquareCapture as Key, undefined]]),
              );
            }

            // Make the move
            pv.pos.play(move);

            // Update legal moves
            pv.ground!.set({ movable: { dests: chessgroundDests(pv.pos) } });
            // Alternatively update whole config?
            // pv.ground!.set(pv.cgState());
          },
        },
      },
    };
  }
}

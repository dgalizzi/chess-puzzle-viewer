import "../../assets/chessground.css";
import "../../assets/theme.css";
import "../../assets/promotion.css";
import PuzzleViewer from "../puzzleViewer";
import { Chessground } from "chessground";
import { Config } from "chessground/config";
import { h, VNode } from "snabbdom";
import { onInsert } from "./util";
import { Role } from "chessops";

export default function view(ctrl: PuzzleViewer) {
  return h(
    `div.blue.merida`,
    {
      attrs: {
        tabindex: 0,
      },
      class: {
        darken: ctrl.isPromotionPromptOpened(),
      },
      hook: onInsert((el: HTMLElement) => {
        ctrl.setGround(
          Chessground(
            el.querySelector(".cg-wrap") as HTMLElement,
            makeConfig(ctrl, el),
          ),
        );
      }),
    },
    [renderBoard(ctrl)],
  );
}

const renderBoard = (ctrl: PuzzleViewer): VNode =>
  h(
    "div.lpv__board",
    h(
      "div.cg-wrap",
      {
        class: {
          "cg-promotion": ctrl.isPromotionPromptOpened(),
          "cg-promotion--open": ctrl.isPromotionPromptOpened(),
        },
        on: {
          click: () => {
            // Clicking the main board cancels the promotion
            if (ctrl.isPromotionPromptOpened()) {
              ctrl.cancelPromotion();
            }
          },
        },
      },
      ctrl.isPromotionPromptOpened() ? renderPromotion(ctrl) : undefined,
    ),
  );

const renderPromotion = (ctrl: PuzzleViewer): VNode[] => {
  const kPromotionRoles: Role[] = ["queen", "knight", "rook", "bishop"];

  const dest = ctrl.getPromotionDest();
  const color = ctrl.getPromotionColor();

  const orientation = ctrl.cgState().orientation;
  let left = dest.charCodeAt(0) - "a".charCodeAt(0);
  let top = color == "white" ? 0 : 7;
  let topStep = color == "white" ? 1 : -1;
  if (orientation == "black") {
    left = 7 - left;
    top = 7 - top;
    topStep *= -1;
  }

  let roles: VNode[] = kPromotionRoles.map((role, i) =>
    h(
      "cg-board",
      h(
        "square.blue.merida",
        {
          style: {
            top: `${(top + i * topStep) * 12.5}%`,
            left: `${left * 12.5}%`,
          },
          on: { click: () => ctrl.resolvePromotion(role) },
        },
        h(`piece.${color}.${role}`),
      ),
    ),
  );
  return roles;
};

function makeConfig(ctrl: PuzzleViewer, el: HTMLElement): Config {
  return {
    viewOnly: false,
    addDimensionsCssVarsTo: el,
    drawable: {
      enabled: true,
      visible: true,
    },
    disableContextMenu: true,
    movable: {
      free: false,
    },
    draggable: {
      enabled: true,
    },
    selectable: {
      enabled: true,
    },
    ...ctrl.cgState(),
  };
}

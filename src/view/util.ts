import { Hooks } from "snabbdom";

export function onInsert<A extends HTMLElement>(
  f: (element: A) => void,
): Hooks {
  return {
    insert: (vnode) => f(vnode.elm as A),
  };
}

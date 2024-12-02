import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => {
  if (mode === "gh") {
    return {
      base: "/chess-puzzle-viewer/",
    };
  } else {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, "src/main.ts"),
          name: "Chess Puzzle Viewer",
        },
      },
      plugins: [dts({ rollupTypes: true })],
    };
  }
});

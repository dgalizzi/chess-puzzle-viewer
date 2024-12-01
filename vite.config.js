import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "gh") {
    return {};
  } else {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, "src/main.ts"),
          name: "Chess Puzzle Viewer",
        },
      },
    };
  }
});

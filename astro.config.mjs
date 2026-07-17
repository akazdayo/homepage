// @ts-check
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import svelte from "@astrojs/svelte";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    icon({
      include: {
        "simple-icons": [
          "nixos",
          "rust",
          "typescript",
          "python",
          "linux",
          "vim",
          "vrchat",
          "twitter",
        ],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

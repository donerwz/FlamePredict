import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship as a fully static site (no server routes). See CLAUDE.md.
  output: "export",
  // Static export cannot use the Next image optimizer at runtime.
  images: { unoptimized: true },
  turbopack: {
    // Pin the workspace root; a stray package-lock.json in the home dir would
    // otherwise be picked up as the root.
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

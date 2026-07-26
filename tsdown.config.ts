import { defineConfig } from "tsdown";

export default defineConfig([
  {
    entry: ["./index.js"],
    hash: false,
    fixedExtension: true,
    deps: { alwaysBundle: /.*/ },
    exe: true,
  },
]);

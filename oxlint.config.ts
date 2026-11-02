import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc", "react", "nextjs", "jsx-a11y"],
  rules: {
    "jsx-a11y/prefer-tag-over-role": "off",
  },
});

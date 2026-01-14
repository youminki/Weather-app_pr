import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@app": path.resolve(__dirname, "./src/app"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom"))
              return "vendor-react";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("axios")) return "vendor-axios";
            return "vendor";
          }

          const featureMatch = id.match(/\/src\/features\/([^/]+)\//);
          if (featureMatch) return `feature-${featureMatch[1]}`;

          const widgetMatch = id.match(/\/src\/widgets\/([^/]+)\//);
          if (widgetMatch) return `widget-${widgetMatch[1]}`;

          if (id.includes("/src/widgets/")) return "widgets";
          if (id.includes("/src/features/")) return "features";
          return null;
        },
      },
    },
  },
});

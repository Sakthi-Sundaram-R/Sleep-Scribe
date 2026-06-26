// vite.config.js
import { defineConfig } from "file:///C:/Sleep-Scribe-Fluidigo/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Sleep-Scribe-Fluidigo/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///C:/Sleep-Scribe-Fluidigo/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["moon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "SleepScribe \u2014 AI Dream Journal",
        short_name: "SleepScribe",
        description: "Capture your dreams and let AI decode their symbols, mood and meaning.",
        theme_color: "#0b0f1f",
        background_color: "#0b0f1f",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        // Cache the app shell + assets; never cache API calls.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/frames/") || url.pathname.startsWith("/hero/"),
            handler: "CacheFirst",
            options: {
              cacheName: "ss-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxTbGVlcC1TY3JpYmUtRmx1aWRpZ29cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFNsZWVwLVNjcmliZS1GbHVpZGlnb1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovU2xlZXAtU2NyaWJlLUZsdWlkaWdvL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHJlYWN0KCksXG4gICAgICAgIFZpdGVQV0Eoe1xuICAgICAgICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgICAgICAgIGluY2x1ZGVBc3NldHM6IFtcIm1vb24uc3ZnXCIsIFwiYXBwbGUtdG91Y2gtaWNvbi5wbmdcIl0sXG4gICAgICAgICAgICBtYW5pZmVzdDoge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiU2xlZXBTY3JpYmUgXHUyMDE0IEFJIERyZWFtIEpvdXJuYWxcIixcbiAgICAgICAgICAgICAgICBzaG9ydF9uYW1lOiBcIlNsZWVwU2NyaWJlXCIsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiQ2FwdHVyZSB5b3VyIGRyZWFtcyBhbmQgbGV0IEFJIGRlY29kZSB0aGVpciBzeW1ib2xzLCBtb29kIGFuZCBtZWFuaW5nLlwiLFxuICAgICAgICAgICAgICAgIHRoZW1lX2NvbG9yOiBcIiMwYjBmMWZcIixcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiMwYjBmMWZcIixcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdFwiLFxuICAgICAgICAgICAgICAgIHN0YXJ0X3VybDogXCIvXCIsXG4gICAgICAgICAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgeyBzcmM6IFwiL3B3YS0xOTIucG5nXCIsIHNpemVzOiBcIjE5MngxOTJcIiwgdHlwZTogXCJpbWFnZS9wbmdcIiB9LFxuICAgICAgICAgICAgICAgICAgICB7IHNyYzogXCIvcHdhLTUxMi5wbmdcIiwgc2l6ZXM6IFwiNTEyeDUxMlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogXCIvcHdhLTUxMi5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3b3JrYm94OiB7XG4gICAgICAgICAgICAgICAgLy8gQ2FjaGUgdGhlIGFwcCBzaGVsbCArIGFzc2V0czsgbmV2ZXIgY2FjaGUgQVBJIGNhbGxzLlxuICAgICAgICAgICAgICAgIG5hdmlnYXRlRmFsbGJhY2tEZW55bGlzdDogWy9eXFwvYXBpXFwvL10sXG4gICAgICAgICAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsUGF0dGVybjogKHsgdXJsIH0pID0+IHVybC5wYXRobmFtZS5zdGFydHNXaXRoKFwiL2ZyYW1lcy9cIikgfHwgdXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoXCIvaGVyby9cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVyOiBcIkNhY2hlRmlyc3RcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwic3MtaW1hZ2VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAyMDAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDMwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgICBwb3J0OiA1MTczLFxuICAgICAgICBvcGVuOiB0cnVlLFxuICAgIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFAsU0FBUyxvQkFBb0I7QUFDM1IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDSixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsWUFBWSxzQkFBc0I7QUFBQSxNQUNsRCxVQUFVO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsVUFDSCxFQUFFLEtBQUssZ0JBQWdCLE9BQU8sV0FBVyxNQUFNLFlBQVk7QUFBQSxVQUMzRCxFQUFFLEtBQUssZ0JBQWdCLE9BQU8sV0FBVyxNQUFNLFlBQVk7QUFBQSxVQUMzRDtBQUFBLFlBQ0ksS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ2I7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLE1BQ0EsU0FBUztBQUFBO0FBQUEsUUFFTCwwQkFBMEIsQ0FBQyxVQUFVO0FBQUEsUUFDckMsZ0JBQWdCO0FBQUEsVUFDWjtBQUFBLFlBQ0ksWUFBWSxDQUFDLEVBQUUsSUFBSSxNQUFNLElBQUksU0FBUyxXQUFXLFVBQVUsS0FBSyxJQUFJLFNBQVMsV0FBVyxRQUFRO0FBQUEsWUFDaEcsU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ0wsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksS0FBSyxlQUFlLEtBQUssS0FBSyxLQUFLLEdBQUc7QUFBQSxZQUNwRTtBQUFBLFVBQ0o7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNKLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNWO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Lynx Books",
        short_name: "Lynx Books",
        description:
          "Список личной библиотеки, трекер чтения, книжный виш лист",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        screenshots: [],
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Кэшируем только обычные REST запросы к Firestore
            urlPattern: ({ url, event }) => {
              // Исключаем WebChannel запросы (Listen/channel)
              if (url.pathname.includes("/Listen/channel")) {
                return false;
              }
              // Кэшируем только обычные Firestore запросы
              return (
                url.hostname === "firestore.googleapis.com" &&
                !url.pathname.includes("/channel")
              );
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 часа
              },
              // Важно: не кэшировать POST запросы
              cacheableResponse: {
                statuses: [0, 200],
                headers: {
                  "x-http-method-override": "GET",
                },
              },
            },
          },
          {
            // Firebase Storage кэширование (оставляем)
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "firebase-storage-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
});

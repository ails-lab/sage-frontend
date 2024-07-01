import { resolve } from "path";

// https://nuxt.com/docs/api/configuration/nuxt-config
import i18nLocales from "./locales/locales.js";

export default defineNuxtConfig({
  components: [
    {
      path: "~/components",
      extensions: ["vue"],
      pathPrefix: false,
    },
  ],
  devtools: { enabled: true },
  alias: {
    "@images": resolve(__dirname, "./assets/img"),
    "@types": resolve(__dirname, "./types"),
    "@styles": resolve(__dirname, "./assets/styles"),
  },
  app: {
    head: {
      title: "SAGE",
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        // { rel: 'stylesheet', href: 'https://unpkg.com/simplebar@latest/dist/simplebar.css' }
      ],
      // script: [
      //   { src: "assets/js/jquery-3.7.0.min.js" },
      //   { src: "https://unpkg.com/simplebar@latest/dist/simplebar.min.js" },
      //   { src: "assets/js/index.js" },
      // ],
      meta: [{ charset: "utf-8" }],
    },
  },
  css: [
    // "bootstrap/dist/css/bootstrap.min.css",
    // "@fortawesome/fontawesome-free/css/all.min.css",
    // "~/assets/styles/jquery-cron.scss",
    // "~/assets/styles/codemirror.scss",
    // "~/assets/styles/main.scss",
  ],
  modules: [
    "@nuxtjs/eslint-module",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    "@nuxtjs/storybook",
  ],
  imports: {
    dirs: ["./stores", "./composables"],
    presets: [
      {
        from: "@vueuse/core",
        imports: [
          { name: "useInfiniteScroll", as: "useInfiniteScrollVueUse" },
          "useElementVisibility",
        ],
      },
    ],
  },
  pinia: {
    autoImports: ["storeToRefs", "defineStore", "acceptHMRUpdate"],
  },
  i18n: {
    locales: i18nLocales,
    defaultLocale: "en",
    lazy: true,
    langDir: "locales/",
    compilation: {
      strictMessage: false,
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_API_URL,
      wsUrl: process.env.WEBSOCKET_URL,
      ai4cultureDeployment: process.env.NUXT_PUBLIC_AI4CULTURE_DEPLOYMENT,
    },
  },
});

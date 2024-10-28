import { createI18n } from 'vue-i18n'
import { createApp } from "vue/dist/vue.esm-bundler.js";

const i18n = createI18n({
  locale: 'zh', // set locale
  fallbackLocale: 'zh',
  messages,
  legacy: true,
  allowComposition: true,
})
let app = createApp(App);
if (import.meta.env.DEV) {
  //动态组件需要使用vue.esm-bundler编译器，但cdn的vue是包含了编译器，所以不需要
  //@ts-ignore
  const { createApp } = await import("vue/dist/vue.esm-bundler.js");
  app = createApp(App);
}
app.use(i18n);
import "./assets/base.css";
import "./assets/index.scss";
// import 'element-plus/components/message/style/css'
// import 'element-plus/components/message-box/style/css'
// import 'element-plus/components/notification/style/css'
import "element-plus/theme-chalk/dark/css-vars.css";
import "./assets/theme.css";
import "default-passive-events";
import ElementPlus from "element-plus";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
//@ts-ignore 因为用了动态组件，所以需要把动态编译功能加上，所以使用这个vue.esm-bundler
// import { createApp } from "vue";
//use_cdn的时候需要注释下面这个使用上面那个
import CodeEditor from "@/components/api-flow/components/node-editor/components/code-editor.vue";
import { creatHtmlIframe } from "@/components/api-flow/engine/node-common-utils";
import "element-plus/dist/index.css"

import { messages } from "@/locale/messages";
import { fineTools } from "@/components/api-flow/engine/fine-tools";
// import LibSrc from "@/components/api-flow/components/lib-src.vue";
import * as tauri_api from '@tauri-apps/api'
import * as dialog from '@tauri-apps/plugin-dialog'
import * as fs from '@tauri-apps/plugin-fs'
import {systemConfigStore} from "@/components/api-flow/engine/store";
window.tauri = {
  api: tauri_api,
  dialog,
  fs
}
window.systemConfigStore=systemConfigStore

//@ts-ignore
// if (!import.meta.env.USE_CDN) {
//   () => import("element-plus/dist/index.css")
// }


app.use(createPinia());
app.use(router);
app.use(ElementPlus);
// app.use(WujieVue)
app.component("CodeEditor", CodeEditor);
// app.component("LibSrc", LibSrc);
window.nodeCommon = {
  creatHtmlIframe,
};

window.fine = fineTools
app.mount("#app");

export { app };

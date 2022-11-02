import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./assets/style/global.less";
import "element-plus/theme-chalk/el-message.css";
import "element-plus/theme-chalk/el-notification.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

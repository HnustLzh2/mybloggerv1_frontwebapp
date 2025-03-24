import { createApp } from 'vue'
import {createPinia } from 'pinia';
import App from './App.vue'
import router from "@/router/router.js";
import Antd from 'ant-design-vue';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
const app = createApp(App)
app.config.productionTip = false;
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(Antd)
app.mount('#app')
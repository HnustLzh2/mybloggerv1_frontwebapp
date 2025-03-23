import { createApp } from 'vue'
import {createPinia } from 'pinia';
import App from './App.vue'
import router from "@/router/router.js";
import Antd from 'ant-design-vue';

const app = createApp(App)
app.config.productionTip = false;
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(Antd)
app.mount('#app')
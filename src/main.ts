import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import '@/style/global.less';
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './permission'
import { setupAntIcon } from "@/core/antd"
import directive from '@/directive'
import { createPinia } from "pinia"

const pinia = createPinia()

const app = createApp(App)
setupAntIcon(app)
directive(app)
app.use(Antd)
app.use(router)
app.use(store)
app.use(pinia)
app.mount('#app');


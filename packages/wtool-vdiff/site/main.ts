import { createApp } from 'vue'
import App from './App.vue'
// lib 构建会把 SFC 样式抽到 dist/wtool-vdiff.css，需单独引入
import '../dist/wtool-vdiff.css'

createApp(App).mount('#app')

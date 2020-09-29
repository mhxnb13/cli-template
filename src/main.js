import "@babel/polyfill"
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './filters'
import {
  clearPending
} from './api/initAxios'

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  // 清除请求地址队列
  clearPending()
  // 路由中含有title的reset值，覆盖title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import LoadScript from 'vue-plugin-load-script'

Vue.use(LoadScript);

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')

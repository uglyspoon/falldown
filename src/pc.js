// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import PC from './PC.vue'
import bus from './eventBus/bus'
Vue.use(bus)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<PC/>',
  components: { PC }
})

import Vue from 'vue'
var bus = new Vue()
export default {
  install: function (Vue, name = '$eventBus') {
    Object.defineProperty(Vue.prototype, name, {value: bus})
  }
}

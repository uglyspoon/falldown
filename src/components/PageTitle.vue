<template>
  <div class="page-title" ref="index" id="index">

  </div>
</template>
<script>
import animateObj from './page-title.js'
export default {
  name: 'page-title',
  props: ['activeIndex', 'previousIndex', 'pageIndex'],
  data () {
    return {
      svg: null,
      animateObj: animateObj
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.animateObj.init(this.$refs.index)
      this.animateObj.start()
    })
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .page-title {
    height:100%;
    width:100%;
    position: relative;
    background-color: #690809;
  }
</style>

<template>
  <div class="page-home page">

    <div class="header">
      <div class="wrapper">
        <div class="index" ref="index"></div>
      </div>
    </div>
    <div class="footer">
      <div class="wrapper">
       <p>
        中共十八大后，中央领导层交替，新旧两任执政党总书记均称：腐败问题解决不好将会“亡党亡国”。至2017年秋，十九大召开，五年中反腐进展如何？从 “老虎苍蝇一起打”，到“反腐进入深水区”，从李春城到孙政才，五年间落马高级干部185人。
         <br>
         <br>
         <small class="note">注：本文统计截至2017年10月10日，官员任职为落马时职务，凡“原XX”为落马时已不担任此职。</small>
      </p>
      </div>
    </div>

  </div>
</template>
<script>
import animateObj from './page-title.js'
export default {
  name: 'pageHome',
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
<style scoped lang="scss">

.header{
  height: 370px;
  background: #5b1112;
}
.footer p {
  max-width: 560px;
  margin: 0 auto;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
    &:first-child{
      margin-top: 60px;
    }
}
.header .wrapper,
.header .index{
  height: 100%;
}
</style>

<template>
  <div class="main-content-wrapper"  ref="content" id="main-content-wrapper">
    <keep-alive>
      <page-rank
        v-if="status === 0"
        :svg-data="data"
          ></page-rank>
      <page-map
        v-if="status===1"
        :svg-data="data">
        </page-map>
      <page-time-number
        v-if="status===2"
        :svg-data="data"></page-time-number>
      <page-time-rank
        v-if="status===3"
        :svg-data="data">
        </page-time-rank>
      <page-charges
        v-if="status===4"
        :svg-data="data"
      ></page-charges>
      <page-discipline
        v-if="status===5"
        :svg-data="data"
      ></page-discipline>
      <page-penalty
        v-if="status===6"
        :svg-data="data">
      </page-penalty>
    </keep-alive>
  </div>
</template>
<script>
import $ from 'jquery'
import 'jquery-mousewheel'
import PageRank from './PageRank.vue'
import PageMap from './PageMap.vue'
import PageTimeNumber from './PageTimeNumber'
import PageTimeRank from './PageTimeRank'
import PageCharges from './PageCharges'
import PageDiscipline from './PageDiscipline'
import PagePenalty from './PagePenalty'
import data from '../../assets/data/data.json'
export default {
  props: ['activeIndex'],
  data () {
    return {
      handler: null,
      status: null,
      data: data,
      waitTime: 1000,
      waiting: false,
      status4Init: false,
      status5Init: false
    }
  },
  watch: {
    activeIndex: function (newVal) {
      if (newVal === 1) {
        if (this.status === null) {
          this.status = 0
        }
      }
    }
  },
  mounted () {
    this.$eventBus.$on('status4Init', () => {
      this.status4Init = true
    })
    this.$eventBus.$on('status5Init', () => {
      this.status5Init = true
    })
    this.$nextTick(() => {
      $(this.$el).on('mousewheel', (event) => {
        if (this.waiting) {
          console.log('wating 1000ms')
          return
        }
        this.waiting = true
        this.handler = setTimeout(() => {
          this.waiting = false
        }, this.waitTime)
        if (event.deltaY < 0) {
          let status = this.status
          if (status === 4 && !this.status4Init) {
            this.status4Init = true
          // 触发事件有序排列
            console.log('有过排列')
            this.$eventBus.$emit('orderStatus4')
            return
          }
          if (status === 5 && !this.status5Init) {
            // 发出有序排列
            this.status5Init = true
            console.log('有过排列')
            this.$eventBus.$emit('orderStatus5')
            return
          }
          status++
          if (status > 6) {
            // next
            this.$emit('slideNext')
          } else {
            this.status = status
          }
        } else {
          let status = this.status
          status--
          if (status < 0) {
            // prev
            this.$emit('slidePrev')
          } else {
            this.status = status
          }
        }
      })
    })
  },
  components: {
    PageRank,
    PageMap,
    PageTimeNumber,
    PageTimeRank,
    PageCharges,
    PagePenalty,
    PageDiscipline
  }
}
</script>

<style>
  .main-content-wrapper{
    width: 100%;
    height: 100%;
  }
</style>

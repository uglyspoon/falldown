<template>
  <div class="main-content-wrapper" ref="content" id="main-content-wrapper">
    <keep-alive>
      <page-rank
      v-if="status===0"
      :svg-data="data"></page-rank>
      <page-china-map
      v-if="status===1"
      :svg-data="data">
      </page-china-map>
      <page-time-number
      v-if="status===2"
      :svg-data="data">
      </page-time-number>
      <page-time-rank
      v-if="status===3"
      :svg-data="data">>
      </page-time-rank>

      <!--<page-charge-group
      v-if="status===4"
      :svg-data="data">
      </page-charge-group>
      -->
      <page-charge-group-time
      v-if="status===4"
      :svg-data="data">
      </page-charge-group-time>
      <!--<page-charge-multiply
      v-if="status===6"
      :svg-data="data" >
      </page-charge-multiply>-->
        <page-charge-multiply-time
      v-if="status===5"
      :svg-data="data" >
      </page-charge-multiply-time>
      <page-penalty
      v-if="status===6"
      :svg-data="data"></page-penalty>
    </keep-alive>
  </div>
</template>
<script>
import * as d3 from 'd3'
import data from '../assets/data/data.json'
import PageRank from './PageRank.vue'
import PageChinaMap from './PageChinaMap.vue'
import PageTimeNumber from './PageTimeNumber.vue'
import PageTimeRank from './PageTimeRank.vue'
import PageChargeGroup from './PageChargeGroup.vue'
import PageChargeGroupTime from './PageChargeGroupTime.vue'
import PageChargeMultiply from './PageChargeMultiply.vue'
import PageChargeMultiplyTime from './PageChargeMultiplyTime.vue'
import PagePenalty from './PagePenalty.vue'
import Hammer from 'hammerjs'
export default {
  name: 'MainContentWrapper',
  props: ['activeIndex'],
  data () {
    return {
      handler: null,
      data: data,
      status: null,
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
      this.handler = new Hammer(this.$refs.content)
      this.handler.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL })
      this.handler.on('swipeup', (swiper) => {
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
          d3.select('.rank-active-group').remove()
          this.$emit('slideNext')
        } else {
          this.status = status
        }
        this.$eventBus.$emit('hideInformationDetails')
      })
      this.handler.on('swipedown', (swiper) => {
        let status = this.status
        status--
        if (status < 0) {
          // prev
          d3.select('.rank-active-group').remove()
          this.$emit('slidePrev')
        } else {
          this.status = status
        }
        this.$eventBus.$emit('hideInformationDetails')
      })
    })
  },
  components: {
    PageRank,
    PageChinaMap,
    PageTimeNumber,
    PageTimeRank,
    PageChargeGroup,
    PageChargeGroupTime,
    PageChargeMultiply,
    PageChargeMultiplyTime,
    PagePenalty
  }
}
</script>
<style lang="scss">
@import "../assets/scss/common.scss";
  .infomation-wrapper {
    position: absolute;
    left:22px;
    top:25px;
    padding: 5px;
    z-index:1000;
    width:4.2rem;
    font-size: 12px;
    background: #fff;
    color: $falldownRed;
    border: 1px solid $falldownRed;
    box-shadow: 3px 3px 3px rgba(0,0,0,0.5),  0 0 2px 2px rgba(144,50,50,0.8);
    transition: all 0.3s linear;
  }
  .information-name {
    padding-bottom: 5px;
    margin-bottom: 5px;
    border-bottom:1px solid #5B1112;
  }
  .information-name b{
    margin-right: 0.5em;
    font-size: 14px;
    color: #000;
  }
  .infomation-wrapper  p {
    line-height: 1.5;
  }
  .main-content-wrapper {
    width: 100%;
    height: 100%;
  }

.rank-active {
    transform: scale3d(0, 0,1);
  }
.rank-active:nth-child(1){
    animation: bobble 0.8s linear 0.1s infinite;;
    will-change: opacity;
  }

.rank-active:nth-child(2){
    animation: bobble 0.8s linear 0.4s infinite;;
    will-change: opacity;
  }

.rank-active:nth-child(3){
    animation: bobble 0.8s  linear 0.6s infinite;;
    will-change: opacity, transform;
  }

  @keyframes bobble {
    0% {
      opacity: 0.8;
      transform: scale3d(1.3, 1.3,1);
    }
    50% {
      opacity: 0.5;
      transform: scale3d(0.9, 0.9,1);
    }
    100% {
      opacity: 1;
      transform: scale3d(1, 1,1);
    }
  }
</style>
